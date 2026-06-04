import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Tu es l'assistant Lyvio, un outil éducatif de bien-être.
Tu aides les utilisateurs à comprendre leurs biomarqueurs dans un langage simple, positif et pédagogique.

Règles strictes :
- Vocabulaire wellness uniquement — jamais de diagnostic, jamais de traitement
- Si une valeur est hors norme ou préoccupante : toujours terminer par "parles-en à ton médecin"
- Ne jamais écrire "cela signifie que tu as [maladie]"
- Ton motivant, accessible, concis
- Réponses max 180 mots`

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const isAdminEmail = user.email === ADMIN_EMAIL

    const { data: profile } = await (supabase
      .from('profiles')
      .select('status, is_admin, last_chat_question_at, first_name')
      .eq('user_id', user.id)
      .single() as any)

    const isAdmin = isAdminEmail || !!(profile?.is_admin)
    const status  = (profile?.status ?? 'pending') as string
    const canChat = isAdmin || status === 'approved_premium'

    if (!canChat) {
      return Response.json({ error: 'Accès réservé aux abonnés Lyvio+.' }, { status: 403 })
    }

    // 1 question / 24 h (admin bypass)
    if (!isAdmin && profile?.last_chat_question_at) {
      const hoursSince = (Date.now() - new Date(profile.last_chat_question_at).getTime()) / 3_600_000
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince)
        return Response.json({ error: `Tu as utilisé ta question du jour. Reviens dans ${hoursLeft} h.` }, { status: 429 })
      }
    }

    const { message, context } = await req.json()
    if (!message?.trim()) {
      return Response.json({ error: 'Message vide' }, { status: 400 })
    }

    // Mark question used (before stream so the counter is always recorded)
    if (!isAdmin) {
      await ((supabase.from('profiles') as any).update({ last_chat_question_at: new Date().toISOString() }).eq('user_id', user.id))
    }

    const systemFull = [
      SYSTEM_PROMPT,
      profile?.first_name ? `L'utilisateur s'appelle ${profile.first_name}.` : '',
      context ? `Contexte de la page : ${context}` : '',
    ].filter(Boolean).join('\n\n')

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemFull,
      messages: [{ role: 'user', content: message }],
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(new TextEncoder().encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[chat]', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
