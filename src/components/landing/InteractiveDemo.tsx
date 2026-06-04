'use client'

import { useState, useEffect, useRef } from 'react'

type Marker = { n: string; v: string; u: string; pos: number; tag: string }
type Domain = { name: string; color: string; score: number; markers: Marker[] }

const DEMO: Record<string, Domain> = {
  sang:    { name: 'Sang',        color: 'var(--color-rust)',     score: 85, markers: [{ n: 'Cholestérol HDL', v: '0,62', u: 'g/L',        pos: 82, tag: 'optimal' }, { n: 'Glycémie à jeun', v: '0,92', u: 'g/L',       pos: 70, tag: 'optimal' }, { n: 'Ferritine',        v: '142',  u: 'ng/mL',     pos: 64, tag: 'bon'     }] },
  compo:   { name: 'Composition', color: 'var(--color-lichen)',   score: 88, markers: [{ n: 'Masse grasse',    v: '14,2', u: '%',          pos: 86, tag: 'optimal' }, { n: 'Masse musculaire', v: '42,1', u: 'kg',        pos: 80, tag: 'optimal' }, { n: 'Hydratation',      v: '61',   u: '%',         pos: 72, tag: 'bon'     }] },
  aero:    { name: 'Aérobie',     color: 'var(--color-aqua)',     score: 92, markers: [{ n: 'VO₂max',          v: '52,4', u: 'ml/kg/min',  pos: 92, tag: 'élite'   }, { n: 'FC au repos',      v: '48',   u: 'bpm',       pos: 88, tag: 'optimal' }, { n: 'Seuil aérobie',    v: '168',  u: 'bpm',       pos: 75, tag: 'bon'     }] },
  sommeil: { name: 'Sommeil',     color: 'var(--color-lavender)', score: 84, markers: [{ n: 'Sommeil profond',  v: '1h45', u: '',           pos: 78, tag: 'bon'     }, { n: 'HRV moyenne',      v: '68',   u: 'ms',        pos: 82, tag: 'optimal' }, { n: 'Efficacité',       v: '91',   u: '%',         pos: 85, tag: 'optimal' }] },
  micro:   { name: 'Microbiote',  color: 'var(--color-amber)',    score: 58, markers: [{ n: 'Diversité Shannon',v: '3,2',  u: '',           pos: 54, tag: 'à suivre'}, { n: 'Firmicutes',       v: '48',   u: '%',         pos: 60, tag: 'normal'  }, { n: 'Bacteroïdes',      v: '32',   u: '%',         pos: 58, tag: 'normal'  }] },
}
const ORDER = ['sang', 'compo', 'aero', 'sommeil', 'micro'] as const

export default function InteractiveDemo() {
  const [active, setActive] = useState<keyof typeof DEMO>('aero')
  const [markersVisible, setMarkersVisible] = useState(true)
  const arcRef = useRef<SVGCircleElement>(null)

  const d = DEMO[active]
  const R = 62
  const C = 2 * Math.PI * R
  const offset = C * (1 - d.score / 100)

  // Animate arc
  useEffect(() => {
    if (arcRef.current) {
      arcRef.current.style.strokeDashoffset = String(C)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (arcRef.current) arcRef.current.style.strokeDashoffset = String(offset)
        })
      })
    }
  }, [active, C, offset])

  const handleTab = (k: keyof typeof DEMO) => {
    setMarkersVisible(false)
    setTimeout(() => { setActive(k); setMarkersVisible(true) }, 160)
  }

  return (
    <div style={{ border: '1px solid var(--color-line)', borderRadius: 18, background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(6px)', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
        {ORDER.map(k => (
          <button
            key={k}
            onClick={() => handleTab(k)}
            style={{
              flex: 1, border: 'none', cursor: 'pointer', padding: '14px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
              fontSize: '0.8rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all .25s',
              backgroundColor: k === active ? 'rgba(255,255,255,0.95)' : 'var(--color-surface)',
              color: k === active ? 'var(--color-ink)' : 'var(--color-ink-3)',
            }}
          >
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              backgroundColor: DEMO[k].color,
              transition: 'transform .25s',
              transform: k === active ? 'scale(1.5)' : 'scale(1)',
            }} />
            <span style={{ fontSize: '0.78rem' }}>{DEMO[k].name}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 34, padding: '34px 38px', alignItems: 'center', minHeight: 230 }}>
        {/* Score dial */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <svg viewBox="0 0 160 160" style={{ width: 150, height: 150 }}>
            <circle cx="80" cy="80" r={R} fill="none" stroke={d.color.replace('var(--color-', 'var(--color-').replace(')', '-soft)')} strokeWidth="11" />
            <circle
              ref={arcRef}
              cx="80" cy="80" r={R}
              fill="none" stroke={d.color} strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={String(C)}
              strokeDashoffset={String(C)}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)' }}
            />
            <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontFamily="Manrope, sans-serif" fontSize="34" fontWeight="200" fill="var(--color-ink)">{d.score}</text>
            <text x="80" y="104" textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fill="var(--color-ink-4)">/ 100</text>
          </svg>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-ink-4)', marginTop: 12 }}>{d.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-ink-3)', marginTop: 3 }}>{d.score}ᵉ percentile · cohorte</div>
        </div>

        {/* Markers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, opacity: markersVisible ? 1 : 0, transition: 'opacity .3s' }}>
          {d.markers.map((m, i) => (
            <MarkerBar key={i} m={m} color={d.color} active={markersVisible} />
          ))}
        </div>
      </div>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--color-ink-4)', textAlign: 'center', paddingBottom: 16, letterSpacing: '0.03em' }}>
        ↑ Clique sur un domaine pour explorer — version simplifiée de ton futur tableau de bord
      </p>
    </div>
  )
}

function MarkerBar({ m, color, active }: { m: Marker; color: string; active: boolean }) {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = '0%'
      const t = setTimeout(() => {
        if (barRef.current) barRef.current.style.width = m.pos + '%'
      }, 80)
      return () => clearTimeout(t)
    }
  }, [active, m.pos])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
          {m.n}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-4)', marginLeft: 8 }}>
            {m.tag}
          </span>
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-ink-2)' }}>
          {m.v} <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-4)' }}>{m.u}</span>
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, backgroundColor: 'var(--color-surface-3)', position: 'relative', overflow: 'hidden' }}>
        <div ref={barRef} style={{ position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 3, backgroundColor: color, width: 0, transition: 'width .7s cubic-bezier(.2,.7,.2,1)' }} />
      </div>
    </div>
  )
}
