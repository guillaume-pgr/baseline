import Link from 'next/link'
import { C, serif, ROUTE_SIGNUP } from './tokens'

export default function PricingTeaser() {
  return (
    <section style={{ margin: '20px 18px', padding: 16, backgroundColor: C.card, borderRadius: 16, textAlign: 'center' }}>
      <p style={{ margin: 0, fontFamily: serif, fontSize: 17, color: C.ink }}>Commence gratuitement.</p>
      <p style={{ margin: '6px 0 12px', fontSize: 12, color: C.inkSoft }}>
        Découverte offerte · Lyvio dès 4,99 €/mois
      </p>
      <Link
        href={ROUTE_SIGNUP}
        style={{
          display: 'block', backgroundColor: C.ink, color: C.lime, textDecoration: 'none',
          fontSize: 14, fontWeight: 500, padding: 12, borderRadius: 24,
        }}
      >
        Créer mon compte
      </Link>
    </section>
  )
}
