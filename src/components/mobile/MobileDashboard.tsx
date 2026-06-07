'use client'

import Link from 'next/link'
import {
  IconDroplet, IconLungs, IconScale, IconMoon, IconMicroscope,
  IconActivity, IconSparkles,
} from '@tabler/icons-react'
import { usePersonaData } from '@/lib/context/PersonaContext'
import { C, serif } from '@/components/landing/mobile/tokens'

type IconCmp = React.ComponentType<{ size?: number; color?: string; stroke?: number }>

// Per-domain icon + accent colour (mockup palette).
const DOMAIN_META: Record<string, { Icon: IconCmp; color: string }> = {
  bloodwork: { Icon: IconDroplet, color: '#D85A30' },
  aerobic: { Icon: IconLungs, color: '#185FA5' },
  composition: { Icon: IconScale, color: '#534AB7' },
  sleep: { Icon: IconMoon, color: '#0F6E56' },
  microbiome: { Icon: IconMicroscope, color: '#C28A1E' },
}

export default function MobileDashboard() {
  const data = usePersonaData()

  if (!data) {
    return (
      <div style={{ padding: '24px 18px', backgroundColor: C.cream, minHeight: '100%' }}>
        <p style={{ fontFamily: serif, fontSize: 22, color: C.ink, margin: '0 0 8px' }}>Bienvenue.</p>
        <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, margin: '0 0 16px' }}>
          Importe ta première prise de sang pour voir ton tableau de bord prendre vie.
        </p>
        <Link
          href="/bloodwork"
          style={{ display: 'inline-block', backgroundColor: C.lime, color: C.ink, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '10px 18px', borderRadius: 24 }}
        >
          Importer un bilan
        </Link>
      </div>
    )
  }

  const first = data.profile.firstName || 'Toi'
  const { value: bioAge, delta } = data.bioAge
  const absDelta = Math.abs(delta)
  const deltaTxt = delta === 0
    ? 'égal à ton âge réel'
    : `${delta > 0 ? '+' : '−'}${absDelta} an${absDelta > 1 ? 's' : ''} vs âge réel`

  // Ring fill = average of available domain scores.
  const scores = data.domains.map(d => d.score).filter(s => s > 0)
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 60
  const CIRC = 2 * Math.PI * 64 // r = 64 → ≈ 402
  const offset = CIRC * (1 - avg / 100)

  return (
    <div style={{ backgroundColor: C.cream, minHeight: '100%' }}>
      {/* Greeting */}
      <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: C.inkSoft }}>Bonjour</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: C.ink }}>{first}</p>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: C.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, fontSize: 13, color: C.ink }}>
          {first.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Bio-age dial */}
      <div style={{ padding: '14px 18px 4px', display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 160 160" width="150" height="150" role="img" aria-label={`Âge biologique : ${bioAge} ans, ${deltaTxt}`}>
          <circle cx="80" cy="80" r="64" fill="none" stroke={C.line} strokeWidth="12" />
          <circle
            cx="80" cy="80" r="64" fill="none" stroke={C.lime} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
          />
          <text x="80" y="72" textAnchor="middle" fontFamily={serif} fontSize="38" fontWeight="500" fill={C.ink}>{bioAge}</text>
          <text x="80" y="92" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fill={C.inkSoft}>ÂGE BIOLOGIQUE</text>
          <text x="80" y="108" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="9" fill={C.greenText}>{deltaTxt}</text>
        </svg>
      </div>

      {/* Domains */}
      <div style={{ padding: '4px 18px 0' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, color: C.inkSoft, letterSpacing: '0.04em' }}>TES DOMAINES</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {data.domains.map(d => {
            const meta = DOMAIN_META[d.id] ?? { Icon: IconActivity, color: C.inkSoft }
            const { Icon } = meta
            return (
              <Link
                key={d.id}
                href={d.href}
                style={{ textDecoration: 'none', backgroundColor: '#fff', border: `0.5px solid ${C.line}`, borderRadius: 12, padding: 10, display: 'block' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Icon size={18} color={meta.color} stroke={1.8} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: d.warn ? '#EF9F27' : '#5FA02E' }} />
                </div>
                <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 500, color: C.ink }}>{d.name}</p>
                <p style={{ margin: 0, fontSize: 11, color: C.inkSoft }}>{d.sub}</p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Insight */}
      <div style={{ margin: '12px 18px 0', backgroundColor: C.ink, borderRadius: 12, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconSparkles size={14} color={C.lime} />
          <span style={{ fontSize: 11, color: C.lime, letterSpacing: '0.04em' }}>INSIGHT LYVIO+</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 12, lineHeight: 1.5, color: C.onInk }}>
          Pose une question à l&apos;assistant sur tes biomarqueurs et ton évolution — réponses éducatives, jamais de diagnostic.
        </p>
        <div style={{ marginTop: 8 }}>
          <Link
            href="/assistant"
            style={{ display: 'inline-block', backgroundColor: C.lime, color: C.ink, textDecoration: 'none', fontSize: 11, fontWeight: 500, padding: '6px 12px', borderRadius: 20 }}
          >
            En parler →
          </Link>
        </div>
      </div>

      <div style={{ height: 16 }} />
    </div>
  )
}
