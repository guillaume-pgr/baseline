import Link from 'next/link'
import { C, serif, ROUTE_SIGNIN } from './tokens'

// Sticky top bar: brand left, outline "Connexion" pill right.
export default function MobileHeader() {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 5, backgroundColor: C.cream,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: `0.5px solid ${C.line}`,
      }}
    >
      <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 500, color: C.ink }}>Lyvio</span>
      <Link
        href={ROUTE_SIGNIN}
        style={{
          fontSize: 12, fontWeight: 500, color: C.ink, textDecoration: 'none',
          border: `0.5px solid ${C.ink}`, padding: '5px 12px', borderRadius: 20,
        }}
      >
        Connexion
      </Link>
    </header>
  )
}
