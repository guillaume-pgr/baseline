'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { ADMIN_EMAIL } from '@/lib/config'

type Mode = 'signup' | 'signin'

export default function AuthPanel() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cgv, setCgv] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setError(''); setEmail(''); setPassword(''); setCgv(false) }
  const switchMode = (m: Mode) => { setMode(m); reset() }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Tous les champs sont requis.'); return }
    if (password.length < 8) { setError('Mot de passe : minimum 8 caractères.'); return }
    if (!cgv) { setError('Accepte les CGV pour continuer.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signUp({ email, password })
      if (err) throw err
      sessionStorage.setItem('lyvio.cgv_accepted_at', new Date().toISOString())
      if (data.session) {
        await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: data.session }) })
      }
      router.push('/onboarding'); router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte.')
      setLoading(false)
    }
  }

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Tous les champs sont requis.'); return }
    setLoading(true); setError('')
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: data.session }) })
      const { data: profile } = await (supabase.from('profiles').select('first_name, status, is_admin').eq('user_id', data.user.id).single() as any)
      // Un compte approuvé (statut approved_* ou admin) va directement au
      // dashboard, même si l'onboarding n'a jamais été complété (first_name vide).
      // Sinon : onboarding si le profil n'est pas renseigné, dashboard si oui.
      const isApproved = !!profile?.is_admin || data.user.email === ADMIN_EMAIL
        || profile?.status === 'approved_free' || profile?.status === 'approved_premium'
      router.push((isApproved || profile?.first_name) ? '/dashboard' : '/onboarding')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion.')
      setLoading(false)
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.84rem',
    padding: '10px 12px', border: '1px solid var(--color-line-2)',
    borderRadius: 9, backgroundColor: 'var(--color-surface-2)',
    outline: 'none', transition: 'border .2s, background .2s', boxSizing: 'border-box',
  }
  const btnStyle: React.CSSProperties = {
    width: '100%', fontFamily: 'var(--font-sans)', fontSize: '0.84rem', fontWeight: 600,
    padding: 11, borderRadius: 9, border: 'none', cursor: loading ? 'default' : 'pointer',
    backgroundColor: 'var(--color-ink)', color: '#fff',
    transition: 'transform .15s, box-shadow .2s', opacity: loading ? 0.7 : 1,
  }

  return (
    <div style={{
      width: '32%', position: 'fixed', top: 0, right: 0, height: '100vh',
      backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-line)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '0 clamp(26px, 2.4vw, 44px)', zIndex: 20, overflowY: 'auto',
    }}>
      {/* Brand */}
      <Logo size={19} style={{ marginBottom: 6 }} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 26 }}>
        Performance health
      </div>

      {/* Toggle */}
      <div style={{ display: 'flex', gap: 4, backgroundColor: 'var(--color-surface-2)', borderRadius: 9, padding: 3, marginBottom: 20 }}>
        {(['signup', 'signin'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)} style={{
            flex: 1, border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.76rem', fontWeight: 600,
            padding: '8px', borderRadius: 7, cursor: 'pointer', transition: 'all .2s',
            backgroundColor: mode === m ? 'var(--color-surface)' : 'transparent',
            color: mode === m ? 'var(--color-ink)' : 'var(--color-ink-3)',
            boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
          }}>
            {m === 'signup' ? 'Créer un compte' : 'Se connecter'}
          </button>
        ))}
      </div>

      {/* Signup */}
      {mode === 'signup' && (
        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 300, letterSpacing: '-0.03em' }}>Crée ton compte</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-3)', padding: '3px 8px', borderRadius: 6, marginLeft: 7, verticalAlign: 'middle' }}>
              Gratuit
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-3)', marginBottom: 18 }}>Commence à suivre ta santé en 2 minutes.</div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: 5 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={fieldStyle} />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', margin: '4px 0 16px', fontSize: '0.72rem', color: 'var(--color-ink-3)', lineHeight: 1.4, cursor: 'pointer' }}>
            <input type="checkbox" checked={cgv} onChange={e => setCgv(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--color-lichen)' }} />
            J'accepte les{' '}
            <Link href="/legal/cgv" target="_blank" style={{ color: 'var(--color-ink-2)' }}>CGV</Link>
            {' '}et la{' '}
            <Link href="/legal/confidentialite" target="_blank" style={{ color: 'var(--color-ink-2)' }}>politique de confidentialité</Link>
          </label>
          {error && <p style={{ fontSize: '0.72rem', color: 'var(--color-rust)', marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Création…' : 'Créer mon compte gratuit'}</button>
          <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-ink-3)', marginTop: 15 }}>
            Déjà un compte ?{' '}
            <span onClick={() => switchMode('signin')} style={{ color: 'var(--color-ink)', fontWeight: 600, cursor: 'pointer' }}>Connecte-toi</span>
          </div>
        </form>
      )}

      {/* Signin */}
      {mode === 'signin' && (
        <form onSubmit={handleSignin}>
          <div style={{ fontSize: '1.25rem', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: 4 }}>Bon retour.</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-3)', marginBottom: 18 }}>Connecte-toi à ton tableau de bord.</div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: 5 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ton@email.com" style={fieldStyle} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, color: 'var(--color-ink-2)', marginBottom: 5 }}>Mot de passe</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={fieldStyle} />
          </div>
          {error && <p style={{ fontSize: '0.72rem', color: 'var(--color-rust)', marginBottom: 10 }}>{error}</p>}
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Connexion…' : 'Se connecter'}</button>
          <div style={{ textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-ink-3)', marginTop: 15 }}>
            Pas encore de compte ?{' '}
            <span onClick={() => switchMode('signup')} style={{ color: 'var(--color-ink)', fontWeight: 600, cursor: 'pointer' }}>Crée-en un</span>
          </div>
        </form>
      )}

      {/* Foot */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', color: 'var(--color-ink-5)', textAlign: 'center', marginTop: 24, lineHeight: 1.7 }}>
        Outil éducatif · Ne remplace pas un avis médical<br />Données hébergées en Europe · RGPD
      </div>
    </div>
  )
}
