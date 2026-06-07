import { NextRequest, NextResponse } from 'next/server'
import type Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getAnthropicClient } from '@/lib/anthropic'
import { checkBloodPanelGate } from '@/lib/health/gating'
import { ORGAN_SYSTEMS, type BloodPanelImport } from '@/lib/health/blood-panel-parser'
import { completeMarkerFromReference } from '@/lib/health/blood-markers-reference'

// Caps — protect tokens & latency
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_PDF_PAGES = 20
const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'] as const

const EXTRACT_SYSTEM = `Tu es un moteur d'extraction de bilans sanguins. On te fournit un document (PDF ou photo) de prise de sang.

Extrais TOUS les marqueurs biologiques présents, sans en inventer aucun. Pour chaque marqueur :
- markerName : nom complet en français (ex. "Hémoglobine", "Cholestérol HDL", "TSH")
- markerCode : code court usuel en MAJUSCULES si visible (ex. HGB, HDL, TSH, GLU) ; sinon une abréviation raisonnable
- value : la valeur numérique mesurée (nombre, point décimal — convertis les virgules)
- unit : l'unité telle qu'imprimée (ex. "g/dL", "mmol/L", "UI/L")
- refMin / refMax : bornes de l'intervalle de référence si présentes, sinon null
- organSystem : range le marqueur dans l'une de ces catégories exactement : ${ORGAN_SYSTEMS.join(', ')}

Détermine aussi panelDate (date du prélèvement, format YYYY-MM-DD ; si absente, la date du jour) et labName (nom du laboratoire si visible, sinon "Laboratoire").

N'extrais que des marqueurs sanguins/biologiques chiffrés. Ignore le texte non pertinent (en-têtes, mentions légales, posologie).`

const TOOL = {
  name: 'record_blood_panel',
  description: 'Enregistre les marqueurs extraits du bilan sanguin.',
  input_schema: {
    type: 'object' as const,
    properties: {
      panelDate: { type: 'string', description: 'Date du prélèvement YYYY-MM-DD' },
      labName: { type: 'string' },
      markers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            markerCode: { type: 'string' },
            markerName: { type: 'string' },
            value: { type: 'number' },
            unit: { type: 'string' },
            refMin: { type: ['number', 'null'] },
            refMax: { type: ['number', 'null'] },
            organSystem: { type: 'string', enum: [...ORGAN_SYSTEMS] },
          },
          required: ['markerCode', 'markerName', 'value', 'unit', 'refMin', 'refMax', 'organSystem'],
        },
      },
    },
    required: ['panelDate', 'labName', 'markers'],
  },
}

function countPdfPages(buf: Buffer): number {
  // Heuristic page count — good enough for a guard, not a parser.
  const matches = buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)
  return matches ? matches.length : 1
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Gating (pre-flight — avoids spending tokens for blocked users)
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
      return NextResponse.json(
        { error: 'Format non supporté. Accepte PDF, PNG, JPG.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 10 Mo).' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    if (mediaType === 'application/pdf') {
      const pages = countPdfPages(buffer)
      if (pages > MAX_PDF_PAGES) {
        return NextResponse.json(
          { error: `PDF trop long (${pages} pages, max ${MAX_PDF_PAGES}).` },
          { status: 400 },
        )
      }
    }

    const base64 = buffer.toString('base64')
    const contentBlock =
      mediaType === 'application/pdf'
        ? { type: 'document' as const, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64 } }
        : { type: 'image' as const, source: { type: 'base64' as const, media_type: mediaType as 'image/png' | 'image/jpeg', data: base64 } }

    console.log('[api/health/extract] calling Claude Vision for', file.name, mediaType, file.size, 'bytes')

    const anthropic = getAnthropicClient()

    let message
    try {
      message = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 8192,
        system: EXTRACT_SYSTEM,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'record_blood_panel' },
        messages: [
          {
            role: 'user',
            content: [
              contentBlock,
              { type: 'text', text: 'Extrais tous les marqueurs de ce bilan sanguin via l\'outil record_blood_panel.' },
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

    const toolUse = message.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    )
    if (!toolUse) {
      return NextResponse.json(
        { error: 'Aucun marqueur n\'a pu être extrait du document.' },
        { status: 422 },
      )
    }

    const extracted = toolUse.input as BloodPanelImport
    if (!extracted.markers || extracted.markers.length === 0) {
      return NextResponse.json(
        { error: 'Aucun marqueur détecté. Vérifie que le document est lisible.' },
        { status: 422 },
      )
    }

    // Auto-complétion déterministe depuis le référentiel local (aucun appel API) :
    // unité, seuils, catégorie et explication manquants sont remplis ici, pour
    // que l'écran de validation arrive déjà complété.
    const markers = extracted.markers.map(m => completeMarkerFromReference(m))
    const unmatched = markers.filter(m => m.needsReview).length
    console.log('[api/health/extract] extracted', markers.length, 'markers,', unmatched, 'à compléter')

    return NextResponse.json({
      panelDate: extracted.panelDate || new Date().toISOString().split('T')[0],
      labName: extracted.labName || 'Laboratoire',
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
