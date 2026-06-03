import Link from 'next/link'

export const metadata = {
  title: 'CGV — Lyvio',
}

const SECTIONS = [
  {
    title: '1. Objet',
    body: `Les présentes Conditions Générales de Vente régissent l'accès et l'utilisation de la plateforme Lyvio, outil éducatif de visualisation de données de santé et de bien-être. Lyvio n'est pas un outil médical et ne délivre aucun diagnostic ni traitement.`,
  },
  {
    title: '2. Accès au service',
    body: `L'accès à Lyvio est conditionné à la création d'un compte et à l'approbation par l'équipe Lyvio. Deux niveaux d'accès sont disponibles : gratuit (fonctionnalités limitées) et Lyvio+ (accès complet, tarification à définir).`,
  },
  {
    title: '3. Données personnelles',
    body: `Les données de santé saisies dans Lyvio sont hébergées en Europe (Francfort, AWS eu-central-1), chiffrées au repos et en transit. Elles ne sont jamais revendues ni partagées avec des tiers sans consentement explicite. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression.`,
  },
  {
    title: '4. Limitation de responsabilité',
    body: `Lyvio est un outil éducatif. Les informations présentées ne constituent pas un avis médical. Toute décision de santé doit être prise en concertation avec un professionnel de santé qualifié.`,
  },
  {
    title: '5. Contact',
    body: `Pour toute question : contact@lyvio.eu`,
  },
]

export default function CGVPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAFAF8', padding: '64px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link
          href="/auth/signup"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textDecoration: 'none', marginBottom: 40, display: 'inline-block' }}
        >
          ← Retour
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: 8, color: 'var(--color-ink)' }}>
          Conditions Générales de Vente
        </h1>
        <p style={{ fontSize: 12, color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)', marginBottom: 48 }}>
          Version 1.0 — juin 2026
        </p>
        {SECTIONS.map(s => (
          <div key={s.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--color-ink)' }}>{s.title}</h2>
            <p style={{ fontSize: 13.5, color: 'var(--color-ink-2)', lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
