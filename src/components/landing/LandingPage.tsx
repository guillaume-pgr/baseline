'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import AuthPanel from './AuthPanel'
import InteractiveDemo from './InteractiveDemo'

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), (i % 3) * 60)
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.landing-reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── Domain ring SVG ─────────────────────────────────────────────────────────
function DomainRing({ color, soft, offset }: { color: string; soft: string; offset: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: 58, height: 58, margin: '0 auto 14px', display: 'block' }}>
      <circle cx="50" cy="50" r="42" fill="none" stroke={soft} strokeWidth="8" />
      <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray="264" strokeDashoffset={String(offset)} transform="rotate(-90 50 50)" />
    </svg>
  )
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function UploadIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-rust)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6m-3 0v6m4 2a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
}
function ChartIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-aqua)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13h4l3 8 4-16 3 8h4"/></svg>
}
function TrendIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-lichen)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8"/></svg>
}
function ShieldIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-aqua)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z"/></svg>
}
function CheckIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-lichen)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
}
function LockIcon() {
  return <svg width="21" height="21" strokeWidth="1.6" stroke="var(--color-amber)" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM16 11V7a4 4 0 00-8 0v4"/></svg>
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  useReveal()

  const PANEL_W = '32%'
  const contentPad = 'clamp(40px, 5vw, 90px)'

  const sec: React.CSSProperties = {
    paddingLeft: contentPad, paddingRight: contentPad,
    maxWidth: 980, margin: '0 auto',
  }

  const monoSmall: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.66rem',
    letterSpacing: '0.14em', textTransform: 'uppercase' as const,
    color: 'var(--color-ink-4)', marginBottom: 14,
  }

  const h2Style: React.CSSProperties = {
    fontSize: 'clamp(1.6rem, 2.6vw, 2.3rem)', fontWeight: 300,
    letterSpacing: '-0.035em', lineHeight: 1.08, marginBottom: 42,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>

      {/* ─── Animated blobs ─── */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: `calc(100% - ${PANEL_W})`, height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { bg: 'var(--color-aqua-soft)',   size: 480, top: -120, left: -80,   delay: '0s'   },
          { bg: 'var(--color-lichen-soft)', size: 420, bottom: -100, left: '30%', delay: '-7s'  },
          { bg: 'var(--color-amber-soft)',  size: 360, top: '40%', right: -60,   delay: '-14s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            filter: 'blur(70px)', opacity: 0.5,
            width: b.size, height: b.size,
            backgroundColor: b.bg,
            top: b.top, left: (b as any).left, bottom: (b as any).bottom, right: (b as any).right,
            animation: `blob-float 22s ease-in-out ${b.delay} infinite`,
          }} />
        ))}
      </div>

      {/* ─── Left scrollable pane ─── */}
      <div style={{ width: `calc(100% - ${PANEL_W})`, position: 'relative', zIndex: 1 }}>
        <div style={{ padding: `0 ${contentPad}` }}>
          <div style={{ maxWidth: 980, margin: '0 auto' }}>

            {/* Topbar */}
            <div className="landing-reveal" style={{ padding: '30px 0 0', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: 'var(--color-lichen)', boxShadow: '0 0 0 4px var(--color-lichen-soft)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>Lyvio</span>
            </div>

            {/* Hero */}
            <section className="landing-reveal" style={{ padding: '64px 0 60px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 22 }}>
                    Performance · Longévité · Données biologiques
                  </div>
                  <h1 style={{ fontSize: 'clamp(2.4rem, 4.4vw, 3.9rem)', fontWeight: 200, lineHeight: 1.03, letterSpacing: '-0.04em', maxWidth: '15ch', marginBottom: 24 }}>
                    Tes biomarqueurs, enfin{' '}
                    <strong style={{ fontWeight: 700 }}>lisibles</strong>{' '}en{' '}
                    <span style={{ background: 'linear-gradient(180deg, transparent 62%, var(--color-lichen-soft) 62%)', padding: '0 4px' }}>
                      un coup d'œil
                    </span>.
                  </h1>
                  <p style={{ fontSize: '1.04rem', color: 'var(--color-ink-3)', maxWidth: '48ch', lineHeight: 1.6 }}>
                    Lyvio rassemble tes prises de sang, ta composition corporelle, ta VO₂max,
                    ton sommeil et ton microbiote dans un tableau de bord unique — et te situe
                    face à une cohorte de profils comme le tien.
                  </p>
                </div>

                {/* Hero dial */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <svg viewBox="0 0 300 300" fill="none" style={{ width: '100%', maxWidth: 300, height: 'auto' }}>
                    <circle cx="150" cy="150" r="142" stroke="var(--color-ink-6)" strokeWidth="1"/>
                    <circle cx="150" cy="150" r="116" stroke="var(--color-aqua-soft)" strokeWidth="11"
                      strokeDasharray="600 729" strokeLinecap="round"
                      transform="rotate(-90 150 150)" className="ring-spin" />
                    <circle cx="150" cy="150" r="92" stroke="var(--color-lichen-soft)" strokeWidth="11"
                      strokeDasharray="440 578" strokeLinecap="round" transform="rotate(-90 150 150)"/>
                    <circle cx="150" cy="150" r="68" stroke="var(--color-amber-soft)" strokeWidth="11"
                      strokeDasharray="250 427" strokeLinecap="round" transform="rotate(-90 150 150)"/>
                    <text x="150" y="132" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2.5" fill="var(--color-ink-4)">
                      ÂGE BIOLOGIQUE
                    </text>
                    <text x="150" y="162" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="Manrope, sans-serif" fontSize="54" fontWeight="200" letterSpacing="-1" fill="var(--color-ink)">
                      26
                    </text>
                    <text x="150" y="190" textAnchor="middle" dominantBaseline="middle"
                      fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="0.5" fill="var(--color-ink-4)">
                      vs 30 chrono
                    </text>
                  </svg>
                </div>
              </div>
            </section>

            {/* Trust strip */}
            <div className="landing-reveal" style={{ display: 'flex', gap: 38, flexWrap: 'wrap', padding: '34px 0', marginTop: 8, borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
              {[
                { n: '5', l: 'domaines biologiques' },
                { n: '40+', l: 'marqueurs analysés' },
                { n: '2 840', l: 'profils de cohorte' },
                { n: '🇪🇺', l: 'hébergé en Europe' },
              ].map(item => (
                <div key={item.l}>
                  <div style={{ fontSize: '1.55rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{item.n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>{item.l}</div>
                </div>
              ))}
            </div>

            {/* Interactive preview */}
            <section className="landing-reveal" style={{ padding: '64px 0 0' }}>
              <div style={monoSmall}>Aperçu interactif</div>
              <h2 style={h2Style}>Clique, et vois tes données <strong style={{ fontWeight: 700 }}>prendre vie</strong>.</h2>
              <InteractiveDemo />
            </section>

            {/* How it works */}
            <section className="landing-reveal" style={{ padding: '64px 0' }}>
              <div style={monoSmall}>Comment ça marche</div>
              <h2 style={h2Style}>Trois étapes, <strong style={{ fontWeight: 700 }}>zéro friction</strong>.</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, background: 'var(--color-line)', border: '1px solid var(--color-line)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { icon: <UploadIcon />, bg: 'var(--color-rust-soft)', num: '01', title: 'Importe tes données', body: `Glisse un PDF de prise de sang ou connecte ta montre, ta balance, ton anneau. Lyvio extrait tout automatiquement.` },
                  { icon: <ChartIcon />, bg: 'var(--color-aqua-soft)', num: '02', title: 'Vois où tu te situes', body: `Chaque marqueur est comparé à une cohorte de profils semblables. Tu sais immédiatement ce qui est optimal et ce qui mérite attention.` },
                  { icon: <TrendIcon />, bg: 'var(--color-lichen-soft)', num: '03', title: 'Suis ton évolution', body: `Lyvio suit tes tendances dans le temps et met en lumière les leviers à plus fort impact pour ta performance et ta longévité.` },
                ].map(s => (
                  <div key={s.num} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', padding: '26px 30px', display: 'flex', gap: 22, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.64rem', color: 'var(--color-ink-4)', marginBottom: 6 }}>{s.num}</div>
                      <h3 style={{ fontSize: '1.08rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>{s.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-3)', lineHeight: 1.55 }}>{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Five domains */}
            <section className="landing-reveal" style={{ paddingBottom: 64 }}>
              <div style={monoSmall}>Cinq signaux</div>
              <h2 style={h2Style}>Une vue <strong style={{ fontWeight: 700 }}>à 360°</strong> de ta biologie.</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1, background: 'var(--color-line)', border: '1px solid var(--color-line)', borderRadius: 16, overflow: 'hidden' }}>
                {[
                  { color: 'var(--color-rust)', soft: 'var(--color-rust-soft)',         offset: 100, name: 'Sang',        sub: 'lipides · fer'   },
                  { color: 'var(--color-lichen)', soft: 'var(--color-lichen-soft)',     offset: 58,  name: 'Composition', sub: 'muscle · gras'   },
                  { color: 'var(--color-aqua)', soft: 'var(--color-aqua-soft)',         offset: 13,  name: 'Aérobie',     sub: 'VO₂max'          },
                  { color: 'var(--color-lavender)', soft: 'var(--color-lavender-soft)', offset: 42,  name: 'Sommeil',     sub: 'HRV · stades'    },
                  { color: 'var(--color-amber)', soft: 'var(--color-amber-soft)',       offset: 110, name: 'Microbiote',  sub: 'diversité'       },
                ].map(d => (
                  <div key={d.name} style={{ background: 'rgba(255,255,255,0.7)', padding: '26px 16px', textAlign: 'center' }}>
                    <DomainRing color={d.color} soft={d.soft} offset={d.offset} />
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 4, letterSpacing: '-0.02em' }}>{d.name}</h4>
                    <p style={{ fontSize: '0.68rem', color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)' }}>{d.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Science */}
            <section className="landing-reveal" style={{ paddingBottom: 64 }}>
              <div style={{ backgroundColor: 'var(--color-ink)', color: '#fff', borderRadius: 20, padding: 46, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-ink-5)', marginBottom: 14 }}>L'approche scientifique</div>
                  <h2 style={{ color: '#fff', fontSize: 'clamp(1.5rem, 2.2vw, 2rem)', fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 1.12, marginBottom: 16 }}>
                    Une valeur seule ne dit <strong style={{ fontWeight: 700 }}>rien</strong>. Le contexte dit <strong style={{ fontWeight: 700 }}>tout</strong>.
                  </h2>
                  <p style={{ color: '#B8B8B8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '42ch' }}>
                    Un HDL de 0,55 g/L, c'est bien ou mal ? Ça dépend de ton âge, ton sexe, ton activité.
                    Lyvio te compare à une cohorte de profils semblables plutôt qu'à des normes génériques.
                  </p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 28 }}>
                  <div style={{ fontSize: '3rem', fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1 }}>88<sup style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--color-ink-5)' }}>e</sup></div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6 }}>percentile · VO₂max</div>
                  <div style={{ height: 8, borderRadius: 4, background: 'linear-gradient(90deg, var(--color-rust), var(--color-amber) 30%, var(--color-lichen) 60%, var(--color-aqua))', position: 'relative', margin: '24px 0 10px' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '88%', width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '3px solid var(--color-ink)', transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 4px rgba(255,255,255,0.15)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--color-ink-5)' }}>
                    {['p10', 'p25', 'médiane', 'p75', 'p90'].map(l => <span key={l}>{l}</span>)}
                  </div>
                </div>
              </div>
            </section>

            {/* RGPD */}
            <section className="landing-reveal" style={{ paddingBottom: 64 }}>
              <div style={monoSmall}>Tes données t'appartiennent</div>
              <h2 style={h2Style}>Confidentialité <strong style={{ fontWeight: 700 }}>par conception</strong>.</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {[
                  { icon: <ShieldIcon />, bg: 'var(--color-aqua-soft)', title: 'Hébergement européen', body: `Tes données sont stockées en Europe (Francfort), dans le respect strict du RGPD. Elles ne quittent jamais le territoire européen.` },
                  { icon: <CheckIcon />, bg: 'var(--color-lichen-soft)', title: 'Tu gardes le contrôle', body: `Tu exportes ou supprimes tes données à tout moment, en un clic. Aucune revente, aucun partage à des tiers, jamais.` },
                  { icon: <LockIcon />, bg: 'var(--color-amber-soft)', title: 'Outil éducatif', body: `Lyvio t'aide à comprendre et optimiser ta santé. Il ne remplace pas un avis médical — pour toute valeur hors norme, parles-en à ton médecin.` },
                ].map(c => (
                  <div key={c.title} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid var(--color-line)', borderRadius: 14, padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {c.icon}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 600, marginBottom: 5, letterSpacing: '-0.02em' }}>{c.title}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-3)', lineHeight: 1.5 }}>{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <div className="landing-reveal" style={{ padding: '46px 0 60px', borderTop: '1px solid var(--color-line)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--color-ink-4)', letterSpacing: '0.03em', lineHeight: 1.9 }}>
                <strong style={{ color: 'var(--color-ink-2)' }}>Lyvio</strong> · Outil éducatif, ne remplace pas un avis médical<br />
                Données hébergées en Europe (Francfort) · Conforme RGPD<br />
                <a href="mailto:contact@lyvio.eu" style={{ color: 'var(--color-ink-3)', textDecoration: 'none' }}>contact@lyvio.eu</a>
                {' · '}
                <a href="https://instagram.com/lyvio.eu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink-3)', textDecoration: 'none' }}>@lyvio.eu</a>
                {' · '}
                <Link href="/legal/cgv" style={{ color: 'var(--color-ink-3)', textDecoration: 'none' }}>CGV</Link>
                {' · '}
                <Link href="/legal/confidentialite" style={{ color: 'var(--color-ink-3)', textDecoration: 'none' }}>Confidentialité</Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Right fixed auth panel ─── */}
      <AuthPanel />

    </div>
  )
}
