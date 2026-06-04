'use client'

import { useState, useRef, useEffect } from 'react'
import { IconChevronDown, IconChevronUp, IconLock } from '@tabler/icons-react'
import { useAccount } from '@/lib/context/useAccount'
import { usePathname } from 'next/navigation'

type ChatMessage = { role: 'user' | 'ai'; text: string }

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Qu'est-ce que le VO₂max et pourquoi c'est important ?",
    a: "Le VO₂max mesure la quantité maximale d'oxygène que ton corps peut utiliser à l'effort. C'est l'un des meilleurs indicateurs de vitalité cardiovasculaire. Un VO₂max élevé est associé à une meilleure endurance, une récupération plus rapide et un vieillissement en meilleure santé.",
  },
  {
    q: "Que signifie mon âge biologique ?",
    a: "L'âge biologique est calculé à partir de tes biomarqueurs (sang, composition corporelle, capacité aérobie, sommeil, microbiote). Un âge bio inférieur à ton âge civil signifie que ton corps fonctionne mieux que la moyenne de ta cohorte — un signal positif d'un mode de vie actif.",
  },
  {
    q: "Pourquoi mon HDL est-il important ?",
    a: "Le HDL (« bon cholestérol ») transporte les graisses depuis les artères vers le foie pour les éliminer. Un HDL élevé est protecteur pour le cœur. L'exercice d'endurance, une alimentation riche en bons gras et la réduction du sucre sont les leviers les plus efficaces pour l'augmenter.",
  },
  {
    q: "Qu'est-ce que la HRV ?",
    a: "La variabilité de la fréquence cardiaque (HRV) mesure les variations entre chaque battement. Une HRV élevée indique un système nerveux autonome bien équilibré — signe d'une bonne récupération, d'une faible inflammation et d'une capacité d'adaptation au stress.",
  },
  {
    q: "Comment Lyvio protège mes données ?",
    a: "Tes données sont hébergées en Europe (Francfort), chiffrées au repos et en transit, et ne sont jamais revendues. Lyvio est conforme au RGPD. Tu peux demander l'export ou la suppression de tes données à tout moment via contact@lyvio.eu.",
  },
  {
    q: "D'où viennent les cohortes de comparaison ?",
    a: "Les cohortes Lyvio agrègent des données publiées dans la littérature scientifique sur des populations actives, segmentées par sexe et tranche d'âge. Elles permettent de situer tes résultats par rapport à des personnes avec un profil similaire — pas par rapport à la population générale.",
  },
]

// ─── Fake chat messages ────────────────────────────────────────────────────────
const DEMO_MESSAGES = [
  {
    role: 'user' as const,
    text: 'Pourquoi mon HDL baisse malgré mes entraînements ?',
  },
  {
    role: 'ai' as const,
    text: "Bonne question. Chez les sportifs d'endurance, le HDL peut stagner ou baisser si l'apport en oméga-3 est insuffisant ou si les glucides raffinés occupent une place trop grande dans l'alimentation. Essaie d'intégrer 2–4 g d'EPA+DHA par jour pendant 12 semaines et de réduire les sucres rapides post-effort. Un bilan de contrôle permettrait de voir l'effet.",
  },
]

// ─── Accordion item ────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
          padding: '13px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-ink)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ flexShrink: 0, color: 'var(--color-ink-3)', marginTop: 1 }}>
          {open
            ? <IconChevronUp size={14} />
            : <IconChevronDown size={14} />
          }
        </span>
      </button>
      {open && (
        <p style={{
          fontSize: 11.5,
          color: 'var(--color-ink-3)',
          lineHeight: 1.65,
          paddingBottom: 13,
          margin: 0,
        }}>
          {a}
        </p>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CompanionPanel() {
  const [tab, setTab] = useState<'faq' | 'chat'>('faq')
  const { canUseChat } = useAccount()
  const pathname = usePathname()

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [chatError, setChatError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const msg = inputValue.trim()
    if (!msg || isStreaming) return
    setInputValue('')
    setChatError('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setIsStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: pathname }),
      })

      if (!res.ok) {
        const data = await res.json()
        setChatError(data.error || 'Erreur serveur')
        setIsStreaming(false)
        return
      }

      // Start streaming
      setMessages(prev => [...prev, { role: 'ai', text: '' }])
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', text: updated[updated.length - 1].text + chunk }
          return updated
        })
      }
    } catch {
      setChatError('Connexion impossible. Réessaie.')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 380,
        backgroundColor: 'var(--color-surface)',
        borderLeft: '1px solid var(--color-line)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-5"
        style={{ height: 56, borderBottom: '1px solid var(--color-line)', flexShrink: 0 }}
      >
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: 'var(--color-ink-3)' }}
        >
          Assistant
        </span>
      </div>

      {/* Toggle */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-line)',
        flexShrink: 0,
      }}>
        {(['faq', 'chat'] as const).map(t => {
          const chatLocked = t === 'chat' && !canUseChat
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                backgroundColor: tab === t ? 'var(--color-ink)' : 'var(--color-surface-2)',
                color: tab === t ? 'var(--color-bg)' : 'var(--color-ink-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {t === 'faq' ? 'FAQ' : 'Chat IA'}
              {chatLocked && <IconLock size={10} strokeWidth={2.5} />}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 16px' }}>
        {tab === 'faq' ? (
          <div>
            {FAQ_ITEMS.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ) : canUseChat ? (
          /* ─── Premium / admin — chat actif ─── */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Notice */}
            <div style={{ margin: '12px 0 8px', padding: '10px 14px', backgroundColor: 'var(--color-lichen-soft)', borderRadius: 8, fontSize: 11, color: '#3d5c2d', lineHeight: 1.5 }}>
              Chat IA · 1 question par jour. Réponses éducatives uniquement — ne remplace pas un avis médical.
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8, paddingBottom: 4 }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 8px', textAlign: 'center' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-aqua-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-aqua)' }}>AI</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.55, maxWidth: 220 }}>
                    Pose une question sur tes biomarqueurs ou ton état de forme.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, backgroundColor: msg.role === 'user' ? 'var(--color-ink)' : 'var(--color-aqua-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: msg.role === 'user' ? 'var(--color-bg)' : 'var(--color-aqua)' }}>
                        {msg.role === 'user' ? 'T' : 'AI'}
                      </span>
                    </div>
                    <div style={{ maxWidth: '82%', padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', backgroundColor: msg.role === 'user' ? 'var(--color-surface-3)' : 'var(--color-aqua-soft)', fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink)', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                      {msg.role === 'ai' && isStreaming && i === messages.length - 1 && (
                        <span style={{ display: 'inline-block', width: 6, height: 12, backgroundColor: 'var(--color-aqua)', marginLeft: 3, borderRadius: 1, animation: 'pulse-dot 1s infinite' }} />
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {chatError && (
              <p style={{ fontSize: 11, color: 'var(--color-rust)', padding: '4px 0 8px', textAlign: 'center' }}>{chatError}</p>
            )}

            {/* Input */}
            <div style={{ paddingTop: 8, paddingBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, padding: '10px 12px', backgroundColor: 'var(--color-surface-2)', borderRadius: 10, border: '1px solid var(--color-line-2)' }}>
                <input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder={isStreaming ? 'En cours…' : 'Pose ta question…'}
                  disabled={isStreaming}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--color-ink)', fontFamily: 'var(--font-sans)', cursor: isStreaming ? 'default' : 'text' }}
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming || !inputValue.trim()}
                  style={{ background: 'none', border: 'none', cursor: isStreaming || !inputValue.trim() ? 'default' : 'pointer', color: isStreaming || !inputValue.trim() ? 'var(--color-ink-5)' : 'var(--color-ink)', fontSize: 16, padding: '0 4px', transition: 'color 0.15s' }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── Free / pending — chat verrouillé ─── */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
              margin: '12px 0 8px', padding: '10px 14px',
              backgroundColor: 'var(--color-amber-soft)', borderRadius: 8,
              fontSize: 11, color: 'var(--color-ink-2)', lineHeight: 1.5,
            }}>
              Le chat interactif nécessite un abonnement Lyvio+{' '}
              <span style={{ color: 'var(--color-ink-3)' }}>(bientôt disponible)</span>
            </div>

            {/* Scripted demo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
              {DEMO_MESSAGES.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, backgroundColor: msg.role === 'user' ? 'var(--color-ink)' : 'var(--color-aqua-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: msg.role === 'user' ? 'var(--color-bg)' : 'var(--color-aqua)', letterSpacing: '0.02em' }}>
                      {msg.role === 'user' ? 'T' : 'AI'}
                    </span>
                  </div>
                  <div style={{ maxWidth: '82%', padding: '9px 12px', borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', backgroundColor: msg.role === 'user' ? 'var(--color-surface-3)' : 'var(--color-aqua-soft)', fontSize: 12, lineHeight: 1.55, color: 'var(--color-ink)' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Disabled input */}
            <div style={{ marginTop: 'auto', paddingTop: 16, paddingBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, padding: '10px 12px', backgroundColor: 'var(--color-surface-2)', borderRadius: 10, border: '1px solid var(--color-line)', opacity: 0.6 }}>
                <input
                  disabled
                  placeholder="Disponible avec Lyvio+"
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--color-ink-4)', cursor: 'not-allowed', fontFamily: 'var(--font-sans)' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
