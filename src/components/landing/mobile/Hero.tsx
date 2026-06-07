import Link from 'next/link'
import { C, serif, ROUTE_SIGNUP } from './tokens'

export default function Hero() {
  return (
    <section style={{ padding: '22px 18px 8px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative lime blob, top-right */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: -10, right: -30, width: 140, height: 140,
          backgroundColor: C.lime, opacity: 0.35, borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.08em', color: C.greenText, fontWeight: 500 }}>
        SANTÉ &amp; PERFORMANCE
      </p>
      <h1
        style={{
          margin: '8px 0 0', fontFamily: serif, fontSize: 30, lineHeight: 1.15,
          fontWeight: 500, color: C.ink, letterSpacing: '-0.01em',
        }}
      >
        Toutes tes données corporelles, enfin réunies.
      </h1>
      <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.6, color: C.inkSoft }}>
        Sang, VO₂max, composition, sommeil, microbiote. Lyvio les agrège et te les explique simplement.
      </p>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link
          href={ROUTE_SIGNUP}
          style={{
            textAlign: 'center', backgroundColor: C.lime, color: C.ink, textDecoration: 'none',
            fontSize: 14, fontWeight: 500, padding: 12, borderRadius: 24,
          }}
        >
          Prêt·e à lire ta santé →
        </Link>
        <span style={{ textAlign: 'center', color: C.inkSoft, fontSize: 12 }}>
          Sans engagement · données hébergées en UE
        </span>
      </div>
    </section>
  )
}
