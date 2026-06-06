import Anthropic from '@anthropic-ai/sdk'

/**
 * Server-only Anthropic client factory.
 *
 * Reads the key explicitly from process.env.ANTHROPIC_API_KEY (no NEXT_PUBLIC_
 * prefix — this must never reach the client bundle). Instantiate inside the
 * request handler (call time), never at module top level, so the key is read
 * when the request runs rather than when the module is first loaded/built.
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error(
      '[anthropic] ANTHROPIC_API_KEY est undefined au moment de l\'appel — ' +
        'vérifie .env.local en local et les Environment Variables sur Vercel ' +
        '(nom exact ANTHROPIC_API_KEY, sans préfixe NEXT_PUBLIC_).',
    )
  }
  return new Anthropic({ apiKey })
}
