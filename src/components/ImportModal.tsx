'use client'

import { useState, useRef, useEffect } from 'react'
import { IconUpload, IconX, IconTrash, IconFileCheck, IconAlertTriangle } from '@tabler/icons-react'

// Reassuring step labels cycled during the Vision analysis.
const ANALYSIS_STEPS = [
  'Lecture du document…',
  'Extraction des marqueurs…',
  'Vérification des valeurs…',
  'Presque prêt…',
]

// En dessous de ce seuil, un marqueur est discrètement signalé à vérifier.
const LOW_CONFIDENCE = 0.6

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const ACCEPTED_HINT = 'PDF, PNG, JPG (max 15 Mo)'

// Shape returned by /api/health/extract for each marker.
interface ExtractedMarker {
  markerCode?: string
  markerName?: string
  value?: number | null
  unit?: string
  refMin?: number | null
  refMax?: number | null
  organSystem?: string | null
  needsReview?: boolean
  confidence?: number
  verifyWarning?: boolean
  verifyReasons?: string[]
  extractionFlag?: boolean
  outOfRange?: boolean
}

// Un bilan daté renvoyé par /api/health/extract (jour + antériorités).
interface ExtractedPanel {
  date: string
  isPrimary: boolean
  markers: ExtractedMarker[]
}

// Editable representation — numeric fields held as strings while the user reviews.
interface EditableMarker {
  id: string // stable key — pour diff fiable des corrections (sous-étape F)
  markerCode: string
  markerName: string
  value: string
  unit: string
  refMin: string
  refMax: string
  organSystem: string
  needsReview: boolean
  confidence: number
  verifyWarning: boolean
  verifyReasons: string[]
  extractionFlag: boolean
  outOfRange: boolean
}

// Un bilan daté en cours de revue (un par date détectée).
interface EditablePanel {
  date: string
  isPrimary: boolean
  markers: EditableMarker[]
}

// Format DD/MM/YYYY pour l'affichage des dates de bilans.
function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Snapshot initial d'un marqueur (à l'extraction) pour repérer les corrections.
interface MarkerSnapshot { markerName: string; value: string; unit: string }

// "À vérifier" = fiabilité de l'EXTRACTION uniquement (nom non reconnu,
// valeur introuvable, bornes incohérentes, ordre de grandeur absurde, confiance
// basse). Une valeur hors norme (outOfRange) n'est JAMAIS "à vérifier".
function isExtractionFlag(m: EditableMarker): boolean {
  return m.extractionFlag
}

function flagTooltip(m: EditableMarker): string {
  const reasons = [...m.verifyReasons]
  if (m.needsReview) reasons.unshift('Marqueur non reconnu — vérifie l’unité et les seuils')
  if (m.confidence < LOW_CONFIDENCE && !m.verifyWarning) reasons.push('Lecture peu sûre — vérifie la valeur')
  return reasons.join(' · ') || 'À vérifier'
}

type Step = 'select' | 'review'

export default function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [labName, setLabName] = useState('')
  // Bilans datés (1 = mono-date classique ; N = jour + antériorités).
  const [panels, setPanels] = useState<EditablePanel[]>([])

  const [stepIdx, setStepIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Boucle d'apprentissage (sous-étape F) : confiance/modèle + snapshot initial.
  const [globalConfidence, setGlobalConfidence] = useState<number | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const originalRef = useRef<Record<string, MarkerSnapshot>>({})

  // Cycle the reassuring step labels while the document is being analysed.
  // (stepIdx is reset to 0 in handleExtract before analysis starts.)
  useEffect(() => {
    if (!isExtracting) return
    const id = setInterval(() => setStepIdx(i => (i + 1) % ANALYSIS_STEPS.length), 1400)
    return () => clearInterval(id)
  }, [isExtracting])

  const reset = () => {
    setStep('select')
    setFile(null)
    setIsExtracting(false)
    setIsSaving(false)
    setError('')
    setLabName('')
    setPanels([])
    setGlobalConfidence(null)
    setModel(null)
    originalRef.current = {}
  }

  const handleClose = () => {
    if (isExtracting || isSaving) return
    reset()
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Format non supporté. Accepte PDF, PNG, JPG.')
      return
    }
    if (selected.size > 15 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 15 Mo).')
      return
    }
    setFile(selected)
    setError('')
  }

  const handleExtract = async () => {
    if (!file) return
    setStepIdx(0)
    setIsExtracting(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/health/extract', { method: 'POST', body: formData })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur lors de l\'analyse')

      setLabName(result.labName || '')
      setGlobalConfidence(typeof result.globalConfidence === 'number' ? result.globalConfidence : null)
      setModel(result.model ?? null)

      const mapMarker = (m: ExtractedMarker, key: string): EditableMarker => ({
        id: key,
        markerCode: m.markerCode ?? '',
        markerName: m.markerName ?? '',
        value: m.value != null ? String(m.value) : '',
        unit: m.unit ?? '',
        refMin: m.refMin != null ? String(m.refMin) : '',
        refMax: m.refMax != null ? String(m.refMax) : '',
        organSystem: m.organSystem ?? 'autres',
        needsReview: m.needsReview ?? false,
        confidence: m.confidence ?? 1,
        verifyWarning: m.verifyWarning ?? false,
        verifyReasons: m.verifyReasons ?? [],
        extractionFlag: m.extractionFlag ?? ((m.needsReview ?? false) || (m.verifyWarning ?? false) || (m.confidence ?? 1) < LOW_CONFIDENCE),
        outOfRange: m.outOfRange ?? false,
      })

      // Nouveau format multi-bilans ; repli mono-bilan (rétro-compat).
      const rawPanels: ExtractedPanel[] = Array.isArray(result.panels)
        ? result.panels
        : [{ date: result.panelDate || '', isPrimary: true, markers: result.markers || [] }]

      const mappedPanels: EditablePanel[] = rawPanels.map((p, pi) => ({
        date: p.date || '',
        isPrimary: !!p.isPrimary,
        markers: (p.markers || []).map((m, mi) => mapMarker(m, `p${pi}-m${mi}`)),
      }))

      // Snapshot initial (corrections nom/unité) — sur le bilan du jour uniquement.
      const primary = mappedPanels.find(p => p.isPrimary) ?? mappedPanels[0]
      originalRef.current = Object.fromEntries(
        (primary?.markers ?? []).map(m => [m.id, { markerName: m.markerName, value: m.value, unit: m.unit }]),
      )
      setPanels(mappedPanels)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse')
    } finally {
      setIsExtracting(false)
    }
  }

  const updateMarker = (panelIdx: number, idx: number, field: keyof EditableMarker, val: string) => {
    setPanels(prev => prev.map((p, pi) =>
      pi !== panelIdx ? p : { ...p, markers: p.markers.map((m, i) => (i === idx ? { ...m, [field]: val } : m)) },
    ))
  }

  const removeMarker = (panelIdx: number, idx: number) => {
    setPanels(prev => prev.map((p, pi) =>
      pi !== panelIdx ? p : { ...p, markers: p.markers.filter((_, i) => i !== idx) },
    ))
  }

  const setPanelDate = (panelIdx: number, date: string) => {
    setPanels(prev => prev.map((p, pi) => (pi === panelIdx ? { ...p, date } : p)))
  }

  const parseMarkers = (ms: EditableMarker[]) => ms
    .map(m => ({
      markerCode: m.markerCode.trim(),
      markerName: m.markerName.trim(),
      value: parseFloat(m.value.replace(',', '.')),
      unit: m.unit.trim(),
      refMin: m.refMin.trim() === '' ? null : parseFloat(m.refMin.replace(',', '.')),
      refMax: m.refMax.trim() === '' ? null : parseFloat(m.refMax.replace(',', '.')),
      organSystem: m.organSystem || 'autres',
    }))
    .filter(m => m.markerName && !isNaN(m.value))

  const handleSave = async () => {
    setError('')

    // Un bilan par date détectée ; on ignore un bilan sans date ou sans marqueur valide.
    const builtPanels = panels
      .map(p => ({ panelDate: p.date, markers: parseMarkers(p.markers) }))
      .filter(p => p.panelDate && p.markers.length > 0)

    if (builtPanels.length === 0) {
      setError('Aucun marqueur valide à enregistrer.')
      return
    }
    if (panels.some(p => !p.date)) {
      setError('Renseigne la date de chaque bilan.')
      return
    }

    // Corrections (sous-étape F) : nom/unité modifiés vs snapshot — bilan du jour.
    const primary = panels.find(p => p.isPrimary) ?? panels[0]
    const corrections = (primary?.markers ?? []).flatMap(m => {
      const orig = originalRef.current[m.id]
      if (!orig) return []
      const nameChanged = orig.markerName.trim() !== m.markerName.trim()
      const unitChanged = orig.unit.trim() !== m.unit.trim()
      if (!nameChanged && !unitChanged) return []
      return [{
        raw_name: orig.markerName.trim() || m.markerName.trim(),
        corrected_canonical: nameChanged ? m.markerName.trim() : null,
        raw_unit: orig.unit.trim() || null,
        corrected_unit: unitChanged ? m.unit.trim() : null,
      }]
    })
    const allMarkers = panels.flatMap(p => p.markers)
    const extractionMeta = {
      globalConfidence,
      model,
      lowConfidenceCount: allMarkers.filter(m => isExtractionFlag(m)).length,
      unmatchedMarkers: allMarkers.filter(m => m.needsReview).map(m => m.markerName.trim()),
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/health/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labName, panels: builtPanels, extractionMeta, corrections }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erreur lors de l\'enregistrement')

      reset()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  const isReview = step === 'review'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        padding: 24,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white', borderRadius: 12, padding: 32,
          maxWidth: isReview ? 720 : 420, width: '100%',
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Importer tes données</h2>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <IconX size={20} />
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-ink-3)', margin: '0 0 20px' }}>
          {isReview
            ? 'Vérifie les valeurs extraites, corrige si besoin, puis enregistre.'
            : 'Glisse un PDF ou une photo de ta prise de sang. Lyvio en extrait les marqueurs automatiquement.'}
        </p>

        {/* ─── Analyzing: animated loading (MODIF 5) ─────────────────── */}
        {!isReview && isExtracting && (
          <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-line)', borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5C7A4A', margin: '0 0 16px' }}>
              {ANALYSIS_STEPS[stepIdx]}
            </p>
            <div style={{ position: 'relative', height: 6, borderRadius: 999, backgroundColor: 'var(--color-lichen-soft)', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, width: '45%', height: '100%', borderRadius: 999, backgroundColor: 'var(--color-lichen)', animation: 'lyvio-loading-slide 1.1s ease-in-out infinite' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.5, margin: '16px 0 0' }}>
              Analyse de ton bilan en cours. Ça prend généralement quelques secondes.
            </p>
          </div>
        )}

        {/* ─── Step: select ─────────────────────────────────────────── */}
        {!isReview && !isExtracting && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-line)', borderRadius: 8, padding: 32,
                textAlign: 'center', cursor: 'pointer', marginBottom: 16,
                backgroundColor: file ? 'var(--color-surface)' : 'transparent',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {file ? (
                <div>
                  <IconFileCheck size={28} color="var(--color-lichen)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--color-ink)' }}>{file.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-ink-3)' }}>
                    {(file.size / 1024).toFixed(0)} Ko
                  </p>
                </div>
              ) : (
                <div>
                  <IconUpload size={32} color="var(--color-ink-3)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                    Clique pour sélectionner
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-ink-4)' }}>{ACCEPTED_HINT}</p>
                </div>
              )}
            </div>

            {error && <p style={{ color: 'var(--color-rust)', fontSize: 12, marginBottom: 16 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleClose} disabled={isExtracting} style={btnSecondary}>Annuler</button>
              <button
                onClick={handleExtract}
                disabled={!file || isExtracting}
                style={btnPrimary(!!file && !isExtracting)}
              >
                {isExtracting ? 'Analyse en cours…' : 'Analyser le document'}
              </button>
            </div>
          </>
        )}

        {/* ─── Step: review ─────────────────────────────────────────── */}
        {isReview && (() => {
          const GRID = '2.3fr 0.8fr 0.7fr 0.6fr 0.6fr 28px'
          const allMarkers = panels.flatMap(p => p.markers)
          const totalMarkers = allMarkers.length
          const flaggedCount = allMarkers.filter(isExtractionFlag).length
          return (
          <>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 14 }}>
              Laboratoire
              <input
                value={labName}
                onChange={e => setLabName(e.target.value)}
                style={{ ...inputStyle, marginTop: 4 }}
              />
            </label>

            {/* Récapitulatif des bilans détectés (un par date) */}
            <div style={{ padding: '10px 12px', marginBottom: 12, backgroundColor: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-ink-2)' }}>
              <strong>{panels.length} bilan{panels.length > 1 ? 's' : ''} détecté{panels.length > 1 ? 's' : ''}</strong>
              {' — '}
              {panels.map((p, i) => (
                <span key={i}>{formatDate(p.date)} ({p.markers.length}){i < panels.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>

            {/* Bandeau de revue ciblée : seuls les marqueurs à vérifier sont mis en avant */}
            {flaggedCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', marginBottom: 12, backgroundColor: 'var(--color-amber-soft)', borderRadius: 8, fontSize: 12, color: 'var(--color-ink-2)' }}>
                <IconAlertTriangle size={15} color="var(--color-amber)" style={{ flexShrink: 0 }} />
                {flaggedCount} valeur{flaggedCount > 1 ? 's' : ''} à vérifier (surlignée{flaggedCount > 1 ? 's' : ''} ci-dessous). Les antériorités à faible confiance sont systématiquement signalées.
              </div>
            ) : (
              <div style={{ padding: '10px 12px', marginBottom: 12, backgroundColor: 'var(--color-lichen-soft)', borderRadius: 8, fontSize: 12, color: '#3d5c2d' }}>
                Tout a été lu avec une bonne confiance. Vérifie d’un coup d’œil et enregistre.
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, border: '1px solid var(--color-line)', borderRadius: 8 }}>
              {panels.map((p, pi) => (
                <div key={pi}>
                  {/* En-tête de bilan daté (date éditable + nature) */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    padding: '8px 12px', position: 'sticky', top: 0, zIndex: 1,
                    backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-line)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="date"
                        value={p.date}
                        onChange={e => setPanelDate(pi, e.target.value)}
                        style={{ ...inputCell, width: 'auto' }}
                      />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
                        padding: '2px 8px', borderRadius: 999,
                        backgroundColor: p.isPrimary ? 'var(--color-ink)' : 'var(--color-amber-soft)',
                        color: p.isPrimary ? 'white' : 'var(--color-amber)',
                      }}>
                        {p.isPrimary ? 'Bilan du jour' : 'Antériorité'}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-ink-4)' }}>
                      {p.markers.length} marqueur{p.markers.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* En-tête de colonnes */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: GRID, gap: 8, padding: '6px 12px',
                    backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-line)',
                    fontSize: 10, fontWeight: 600, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    <span>Marqueur</span><span>Valeur</span><span>Unité</span><span>Réf. min</span><span>Réf. max</span><span />
                  </div>

                  {p.markers.map((m, idx) => {
                    const flagged = isExtractionFlag(m)
                    return (
                      <div key={m.id} style={{
                        display: 'grid', gridTemplateColumns: GRID,
                        gap: 8, padding: '6px 12px', alignItems: 'center', borderBottom: '1px solid var(--color-line)',
                        borderLeft: flagged ? '3px solid var(--color-amber)' : '3px solid transparent',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
                          {flagged && <IconAlertTriangle size={13} color="var(--color-amber)" style={{ flexShrink: 0 }} />}
                          <input
                            value={m.markerName}
                            onChange={e => updateMarker(pi, idx, 'markerName', e.target.value)}
                            style={flagged ? { ...inputCell, borderColor: 'var(--color-amber)' } : inputCell}
                            title={flagged ? flagTooltip(m) : m.markerName}
                          />
                        </div>
                        <input value={m.value} onChange={e => updateMarker(pi, idx, 'value', e.target.value)} style={inputCell} inputMode="decimal" />
                        <input value={m.unit} onChange={e => updateMarker(pi, idx, 'unit', e.target.value)} style={inputCell} />
                        <input value={m.refMin} onChange={e => updateMarker(pi, idx, 'refMin', e.target.value)} style={inputCell} inputMode="decimal" />
                        <input value={m.refMax} onChange={e => updateMarker(pi, idx, 'refMax', e.target.value)} style={inputCell} inputMode="decimal" />
                        <button onClick={() => removeMarker(pi, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-ink-4)' }}>
                          <IconTrash size={15} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
              {totalMarkers === 0 && (
                <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--color-ink-4)' }}>
                  Aucun marqueur. Reviens en arrière et réessaie.
                </p>
              )}
            </div>

            {error && <p style={{ color: 'var(--color-rust)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setStep('select'); setError('') }} disabled={isSaving} style={btnSecondary}>
                Retour
              </button>
              <button onClick={handleSave} disabled={isSaving || totalMarkers === 0} style={btnPrimary(!isSaving && totalMarkers > 0)}>
                {isSaving
                  ? 'Enregistrement…'
                  : `Enregistrer ${panels.length} bilan${panels.length > 1 ? 's' : ''} · ${totalMarkers} marqueur${totalMarkers > 1 ? 's' : ''}`}
              </button>
            </div>
          </>
          )
        })()}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', border: '1px solid var(--color-line)',
  borderRadius: 6, fontSize: 13, color: 'var(--color-ink)', boxSizing: 'border-box',
}

const inputCell: React.CSSProperties = {
  width: '100%', padding: '5px 7px', border: '1px solid var(--color-line)',
  borderRadius: 5, fontSize: 12, color: 'var(--color-ink)', boxSizing: 'border-box',
}

const btnSecondary: React.CSSProperties = {
  flex: 1, padding: '10px 16px', border: '1px solid var(--color-line)',
  borderRadius: 8, backgroundColor: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 500,
}

const btnPrimary = (enabled: boolean): React.CSSProperties => ({
  flex: 2, padding: '10px 16px', border: 'none', borderRadius: 8,
  backgroundColor: enabled ? 'black' : 'var(--color-surface-2)',
  color: enabled ? 'white' : 'var(--color-ink-3)',
  cursor: enabled ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 500,
})
