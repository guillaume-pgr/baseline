import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAIL } from '@/lib/config'

// ANTHROPIC_API_KEY must be set in .env.local and in Vercel Environment Variables
const anthropic = new Anthropic()  // reads ANTHROPIC_API_KEY automatically

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
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const isAdminEmail = user.email === ADMIN_EMAIL

    const { data: profile, error: profileError } = await (supabase
      .from('profiles')
      .select('status, is_admin, last_chat_question_at, first_name')
      .eq('user_id', user.id)
      .single() as any)

    if (profileError) {
      console.error('[chat] profile fetch error:', profileError)
    }

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

    const body = await req.json()
    const { message, context } = body
    if (!message?.trim()) {
      return Response.json({ error: 'Message vide' }, { status: 400 })
    }

    // Mark question used before streaming so it's always counted
    if (!isAdmin) {
      await ((supabase.from('profiles') as any)
        .update({ last_chat_question_at: new Date().toISOString() })
        .eq('user_id', user.id))
    }

    const systemFull = [
      SYSTEM_PROMPT,
      profile?.first_name ? `L'utilisateur s'appelle ${profile.first_name}.` : '',
      context ? `Contexte de la page : ${context}` : '',
    ].filter(Boolean).join('\n\n')

    // Use messages.create with stream:true so the API request is made eagerly.
    // This means auth/model errors are caught here (before headers are sent)
    // instead of silently breaking the stream mid-response.
    let anthropicStream: Awaited<ReturnType<typeof anthropic.messages.create>> & AsyncIterable<any>
    try {
      anthropicStream = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        stream: true,
        system: systemFull,
        messages: [{ role: 'user', content: message }],
      }) as any
    } catch (apiErr: any) {
      console.error('[chat] Anthropic API error:', apiErr?.message ?? apiErr)
      const msg = apiErr?.message?.includes('API key')
        ? 'Clé API Anthropic manquante ou invalide. Vérifie ANTHROPIC_API_KEY dans .env.local et Vercel.'
        : apiErr?.message?.includes('model')
          ? `Modèle invalide : ${apiErr.message}`
          : apiErr?.message ?? 'Erreur API Anthropic'
      return Response.json({ error: msg }, { status: 500 })
    }

    // Stream the response
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of anthropicStream as AsyncIterable<any>) {
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(new TextEncoder().encode(event.delta.text))
            }
          }
        } catch (streamErr) {
          console.error('[chat] stream error:', streamErr)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })

  } catch (err: any) {
    console.error('[chat] unexpected error:', err?.message ?? err)
    return Response.json({ error: err?.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
