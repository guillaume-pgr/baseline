'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ComingSoonModalProps {
  open: boolean
  onClose: () => void
}

export default function ComingSoonModal({ open, onClose }: ComingSoonModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setErrorMsg('Adresse email invalide.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('waitlist').insert({ email })
      if (error && error.code !== '23505') {
        throw error
      }
      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMsg('Une erreur est survenue. Réessaie.')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          maxWidth: 380,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 300, margin: 0, marginBottom: 16 }}>
          Bientôt disponible
        </h2>

        <p style={{ fontSize: 13, color: 'var(--color-ink-3)', margin: 0, marginBottom: 24, lineHeight: 1.6 }}>
          Le suivi de tes données réelles arrive très prochainement. En attendant, explore Lyvio en mode démo.
        </p>

        {/* Waitlist form */}
        <div style={{ borderTop: '1px solid var(--color-line)', paddingTop: 20, marginBottom: 20 }}>
          {status === 'success' ? (
            <p style={{
              fontSize: 13, fontWeight: 500,
              color: '#5C7A4A',
              backgroundColor: 'var(--color-lichen-soft)',
              padding: '12px 16px',
              borderRadius: 8,
              textAlign: 'center',
            }}>
              Merci&nbsp;! On te préviendra en premier.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                placeholder="ton@email.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 13,
                  border: `1px solid ${errorMsg ? 'var(--color-rust)' : 'var(--color-line-2)'}`,
                  borderRadius: 8,
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--color-ink)',
                  backgroundColor: 'var(--color-bg)',
                  boxSizing: 'border-box',
                }}
              />
              {errorMsg && (
                <p style={{ fontSize: 11, color: 'var(--color-rust)', margin: 0 }}>{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  backgroundColor: 'var(--color-lichen)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: status === 'loading' ? 'default' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {status === 'loading' ? 'Envoi…' : 'Être prévenu·e au lancement'}
              </button>
            </form>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ink)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'black'
          }}
        >
          Compris
        </button>
      </div>
    </div>
  )
}
