import { NextRequest, NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { checkBloodPanelGate } from '@/lib/health/gating'
import { reconcileExtraction, type RawExtraction } from '@/lib/health/reconcile'
import { verifyMarkers } from '@/lib/health/verify'

// Modèle d'extraction = le plus précis disponible (le chat reste sur Sonnet).
const MODEL_EXTRACTION = 'claude-opus-4-8'

// Caps — protègent tokens & latence.
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB
const MAX_PDF_PAGES = 25
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'] as const

const EXTRACT_SYSTEM = `Tu es un moteur d'extraction de comptes rendus de laboratoire de biologie médicale (le plus souvent en français, parfois dans une autre langue). Ta sortie alimente un pipeline déterministe : sois exhaustif, précis et littéral.

CE QUE TU EXTRAIS
- UNIQUEMENT les résultats du PATIENT. Pour chaque analyse numérique : son nom tel qu'écrit, sa valeur, son unité, et son intervalle de référence.
- Les métadonnées : nom du laboratoire, date de prélèvement, date du compte rendu, sexe et âge du patient si présents.

CE QUE TU IGNORES (mets is_patient_value=false ou n'extrais pas)
- Les valeurs de CONTRÔLE ou de TÉMOIN (ex. "Temps de Quick du témoin", "témoin").
- Les colonnes d'ANTÉRIORITÉS / résultats antérieurs (ne garde que le résultat courant).
- Tout texte d'INTERPRÉTATION, de commentaire ou de pédagogie (paragraphes sur le diabète, la vitamine D, recommandations…), les en-têtes, pieds de page, mentions légales, coordonnées.
- Les résultats QUALITATIFS non numériques ("Limpide", "Négatif", "Absence", "Jaune") — sauf si une valeur numérique est réellement donnée.

RÈGLES DE LECTURE
- Bornes de référence, gère toutes les formes :
  • "(4 000-11 000)" ou "4.0 - 5.2" → ref_operator="range", ref_low et ref_high renseignés.
  • "< à 110", "inf à 3.5", "< 1,60" → ref_operator="lt", ref_high renseigné, ref_low=null.
  • "sup à 0.40", "> ou = 90", "> 60" → ref_operator="gt", ref_low renseigné, ref_high=null.
  • aucune borne → ref_operator="none", ref_low=null, ref_high=null.
- Nombres français : la virgule est décimale (0,84 → 0.84) ; les espaces (ou points) sont des séparateurs de milliers (5 010 → 5010). Renvoie des nombres JSON normalisés (point décimal, sans séparateur de milliers).
- Double unité sur une même ligne (unité conventionnelle + SI, ex. "1,80 g/L (4,65 mmol/L)") : mets la valeur conventionnelle dans value/raw_unit et la SI dans secondary_value/secondary_unit. NE crée PAS deux marqueurs.
- Formule leucocytaire : retiens la valeur ABSOLUE (en /mm3 ou Giga/L) dans value/raw_unit ; le pourcentage va dans secondary_value/secondary_unit ("%").
- section : le titre de la rubrique du bilan où figure la ligne (ex. "Hématologie", "Lipides", "Ionogramme"), si visible.
- confidence : ta confiance honnête par marqueur (0 à 1). Baisse-la si la valeur ou l'unité est ambiguë, mal alignée ou peu lisible.
- is_patient_value : true pour un vrai résultat du patient, false pour un témoin/contrôle.

Réponds en appelant l'outil record_lab_report avec un objet STRICTEMENT conforme. N'invente aucune valeur : si tu n'es pas sûr d'une valeur, baisse sa confidence.`

const TOOL: Anthropic.Tool = {
  name: 'record_lab_report',
  description: 'Enregistre les métadonnées et tous les résultats numériques du patient extraits du compte rendu.',
  input_schema: {
    type: 'object',
    properties: {
      metadata: {
        type: 'object',
        properties: {
          lab_name: { type: ['string', 'null'] },
          collection_date: { type: ['string', 'null'], description: 'Date de prélèvement, format ISO YYYY-MM-DD' },
          report_date: { type: ['string', 'null'], description: 'Date du compte rendu, format ISO YYYY-MM-DD' },
          patient_sex: { type: ['string', 'null'], enum: ['M', 'F', null] },
          patient_age: { type: ['integer', 'null'] },
        },
        required: ['lab_name', 'collection_date', 'report_date', 'patient_sex', 'patient_age'],
      },
      markers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            raw_name: { type: 'string' },
            value: { type: ['number', 'null'] },
            raw_unit: { type: ['string', 'null'] },
            ref_low: { type: ['number', 'null'] },
            ref_high: { type: ['number', 'null'] },
            ref_operator: { type: 'string', enum: ['range', 'lt', 'gt', 'none'] },
            secondary_value: { type: ['number', 'null'] },
            secondary_unit: { type: ['string', 'null'] },
            section: { type: ['string', 'null'] },
            confidence: { type: 'number' },
            is_patient_value: { type: 'boolean' },
          },
          required: ['raw_name', 'value', 'raw_unit', 'ref_low', 'ref_high', 'ref_operator', 'secondary_value', 'secondary_unit', 'section', 'confidence', 'is_patient_value'],
        },
      },
    },
    required: ['metadata', 'markers'],
  } as Anthropic.Tool.InputSchema,
  // Prompt caching : le schéma volumineux et stable est mis en cache.
  cache_control: { type: 'ephemeral' },
}

function countPdfPages(buf: Buffer): number {
  const matches = buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)
  return matches ? matches.length : 1
}

// Couche texte du PDF (si présente) — conservée pour l'auto-vérification (sous-étape D).
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { extractText, getDocumentProxy } = await import('unpdf')
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return typeof text === 'string' ? text : ''
  } catch (e) {
    console.warn('[api/health/extract] couche texte PDF indisponible:', e instanceof Error ? e.message : e)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Gating (pré-flight)
    const gate = await checkBloodPanelGate(supabase, user)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier sélectionné' }, { status: 400 })
    }

    const mediaType = file.type
    if (!ACCEPTED.includes(mediaType as (typeof ACCEPTED)[number])) {
      return NextResponse.json({ error: 'Format non supporté. Accepte PDF, PNG, JPG.' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 15 Mo).' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isPdf = mediaType === 'application/pdf'

    // Couche texte (PDF) pour l'auto-vérification (D). Les PDF scannés sont gérés
    // par le rendu natif des pages côté modèle (vision) ; ici on récupère le
    // texte sélectionnable s'il existe.
    let pdfText = ''
    if (isPdf) {
      const pages = countPdfPages(buffer)
      if (pages > MAX_PDF_PAGES) {
        return NextResponse.json({ error: `PDF trop long (${pages} pages, max ${MAX_PDF_PAGES}).` }, { status: 400 })
      }
      pdfText = await extractPdfText(buffer)
    }

    const base64 = buffer.toString('base64')
    const contentBlock: Anthropic.ContentBlockParam = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType as 'image/png' | 'image/jpeg', data: base64 } }

    console.log('[api/health/extract] extraction', file.name, mediaType, file.size, 'bytes, texte PDF:', pdfText.length, 'car.')

    const anthropic = getAnthropicClient()

    let message: Anthropic.Message
    try {
      message = await anthropic.messages.create({
        model: MODEL_EXTRACTION,
        max_tokens: 8192,
        system: [{ type: 'text', text: EXTRACT_SYSTEM, cache_control: { type: 'ephemeral' } }],
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'record_lab_report' },
        messages: [
          {
            role: 'user',
            content: [
              contentBlock,
              { type: 'text', text: 'Extrais tout le compte rendu via l\'outil record_lab_report.' },
            ],
          },
        ],
      })
    } catch (apiErr) {
      const emsg = apiErr instanceof Error ? apiErr.message : String(apiErr)
      console.error('[api/health/extract] Anthropic error:', emsg)
      const msg = emsg.includes('API key')
        ? 'Clé API Anthropic manquante ou invalide. Vérifie ANTHROPIC_API_KEY.'
        : emsg || 'Erreur lors de l\'analyse du document.'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    // Parse robuste de la sortie structurée (tool_use → objet déjà parsé).
    const toolUse = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    let data: RawExtraction | null = null
    if (toolUse) {
      data = toolUse.input as RawExtraction
    } else {
      // Repli : tenter de parser un éventuel bloc texte JSON (strip backticks).
      const textBlock = message.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
      if (textBlock) {
        try {
          const cleaned = textBlock.text.replace(/```json|```/g, '').trim()
          data = JSON.parse(cleaned) as RawExtraction
        } catch {
          data = null
        }
      }
    }

    if (!data || !Array.isArray(data.markers)) {
      return NextResponse.json(
        { error: 'Extraction illisible. Vérifie que le document est un bilan sanguin lisible.' },
        { status: 422 },
      )
    }

    // ─── Réconciliation déterministe (sous-étape C, zéro appel API) ──────────
    const panel = reconcileExtraction(data)
    if (panel.markers.length === 0) {
      return NextResponse.json(
        { error: 'Aucun marqueur détecté. Vérifie que le document est lisible.' },
        { status: 422 },
      )
    }

    // ─── Auto-vérification (sous-étape D, zéro appel API) ────────────────────
    const { markers, globalConfidence } = verifyMarkers(panel.markers, pdfText)

    console.log('[api/health/extract] réconcilié', markers.length, 'marqueurs',
      `(${markers.filter(m => m.needsReview).length} à compléter,`,
      `${markers.filter(m => m.verifyWarning).length} à vérifier, confiance ${globalConfidence})`)

    return NextResponse.json({
      panelDate: panel.panelDate,
      labName: panel.labName,
      patientSex: panel.patientSex,
      globalConfidence,
      markers,
    })
  } catch (error) {
    console.error('[api/health/extract] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 },
    )
  }
}
