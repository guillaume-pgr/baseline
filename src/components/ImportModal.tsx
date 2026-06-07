'use client'

import { useState, useRef, useEffect } from 'react'
import { IconUpload, IconX, IconTrash, IconFileCheck } from '@tabler/icons-react'

// Reassuring step labels cycled during the Vision analysis (MODIF 5).
const ANALYSIS_STEPS = [
  'Lecture du document…',
  'Extraction des marqueurs…',
  'Vérification des unités…',
  'Presque prêt…',
]

interface ImportModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const ACCEPTED_HINT = 'PDF, PNG, JPG (max 10 Mo)'

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
}

// Editable representation — numeric fields held as strings while the user reviews.
interface EditableMarker {
  markerCode: string
  markerName: string
  value: string
  unit: string
  refMin: string
  refMax: string
  organSystem: string
  needsReview: boolean
}

type Step = 'select' | 'review'

export default function ImportModal({ open, onClose, onSuccess }: ImportModalProps) {
  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [panelDate, setPanelDate] = useState('')
  const [labName, setLabName] = useState('')
  const [markers, setMarkers] = useState<EditableMarker[]>([])

  const [stepIdx, setStepIdx] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    setPanelDate('')
    setLabName('')
    setMarkers([])
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
    if (selected.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).')
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

      setPanelDate(result.panelDate || '')
      setLabName(result.labName || '')
      setMarkers(
        (result.markers || []).map((m: ExtractedMarker) => ({
          markerCode: m.markerCode ?? '',
          markerName: m.markerName ?? '',
          value: m.value != null ? String(m.value) : '',
          unit: m.unit ?? '',
          refMin: m.refMin != null ? String(m.refMin) : '',
          refMax: m.refMax != null ? String(m.refMax) : '',
          organSystem: m.organSystem ?? 'autres',
          needsReview: m.needsReview ?? false,
        })),
      )
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse')
    } finally {
      setIsExtracting(false)
    }
  }

  const updateMarker = (idx: number, field: keyof EditableMarker, val: string) => {
    setMarkers(prev => prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m)))
  }

  const removeMarker = (idx: number) => {
    setMarkers(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    setError('')

    const parsed = markers
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

    if (parsed.length === 0) {
      setError('Aucun marqueur valide à enregistrer.')
      return
    }
    if (!panelDate) {
      setError('Renseigne la date du bilan.')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch('/api/health/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panelDate, labName, markers: parsed }),
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
        {isReview && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <label style={{ flex: 1, fontSize: 12, color: 'var(--color-ink-3)' }}>
                Date du bilan
                <input
                  type="date"
                  value={panelDate}
                  onChange={e => setPanelDate(e.target.value)}
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
              <label style={{ flex: 1, fontSize: 12, color: 'var(--color-ink-3)' }}>
                Laboratoire
                <input
                  value={labName}
                  onChange={e => setLabName(e.target.value)}
                  style={{ ...inputStyle, marginTop: 4 }}
                />
              </label>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, border: '1px solid var(--color-line)', borderRadius: 8 }}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.8fr 0.7fr 0.7fr 28px',
                gap: 8, padding: '8px 12px', position: 'sticky', top: 0,
                backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-line)',
                fontSize: 10, fontWeight: 600, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <span>Marqueur</span><span>Valeur</span><span>Unité</span><span>Réf. min</span><span>Réf. max</span><span />
              </div>
              {markers.map((m, idx) => (
                <div key={idx} style={{
                  display: 'grid', gridTemplateColumns: '1.6fr 0.9fr 0.8fr 0.7fr 0.7fr 28px',
                  gap: 8, padding: '6px 12px', alignItems: 'center', borderBottom: '1px solid var(--color-line)',
                }}>
                  <input
                    value={m.markerName}
                    onChange={e => updateMarker(idx, 'markerName', e.target.value)}
                    style={m.needsReview ? { ...inputCell, borderColor: 'var(--color-amber)' } : inputCell}
                    title={m.needsReview ? 'Marqueur non reconnu — vérifie l’unité et les seuils.' : undefined}
                  />
                  <input value={m.value} onChange={e => updateMarker(idx, 'value', e.target.value)} style={inputCell} inputMode="decimal" />
                  <input value={m.unit} onChange={e => updateMarker(idx, 'unit', e.target.value)} style={inputCell} />
                  <input value={m.refMin} onChange={e => updateMarker(idx, 'refMin', e.target.value)} style={inputCell} inputMode="decimal" />
                  <input value={m.refMax} onChange={e => updateMarker(idx, 'refMax', e.target.value)} style={inputCell} inputMode="decimal" />
                  <button onClick={() => removeMarker(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'var(--color-ink-4)' }}>
                    <IconTrash size={15} />
                  </button>
                </div>
              ))}
              {markers.length === 0 && (
                <p style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--color-ink-4)' }}>
                  Aucun marqueur. Reviens en arrière et réessaie.
                </p>
              )}
            </div>

            {markers.some(m => m.needsReview) && (
              <p style={{ fontSize: 11, color: 'var(--color-amber)', marginBottom: 10 }}>
                Certains marqueurs n’ont pas été reconnus (bordure orange) — vérifie leur unité et leurs seuils avant d’enregistrer.
              </p>
            )}

            {error && <p style={{ color: 'var(--color-rust)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => { setStep('select'); setError('') }} disabled={isSaving} style={btnSecondary}>
                Retour
              </button>
              <button onClick={handleSave} disabled={isSaving || markers.length === 0} style={btnPrimary(!isSaving && markers.length > 0)}>
                {isSaving ? 'Enregistrement…' : `Enregistrer ${markers.length} marqueur${markers.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </>
        )}
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
