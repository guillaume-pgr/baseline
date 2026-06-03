import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité — Lyvio',
}

const SECTIONS = [
  {
    title: '1. Responsable du traitement',
    body: `Lyvio (contact@lyvio.eu) est responsable du traitement de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).`,
  },
  {
    title: '2. Données collectées',
    body: `Lyvio collecte les données que vous saisissez volontairement : email, informations démographiques (âge, sexe, taille), données de santé importées (résultats de bilans sanguins, mesures corporelles). Aucune donnée n'est collectée à votre insu.`,
  },
  {
    title: '3. Finalité du traitement',
    body: `Vos données sont utilisées exclusivement pour personnaliser votre tableau de bord Lyvio, calculer vos indicateurs de bien-être et vous permettre de comparer vos résultats à des cohortes de référence. Elles ne sont jamais utilisées à des fins publicitaires ou commerciales.`,
  },
  {
    title: '4. Hébergement et sécurité',
    body: `Toutes les données sont hébergées en Europe (Francfort, AWS eu-central-1) via Supabase. Elles sont chiffrées au repos (AES-256) et en transit (TLS 1.3). L'accès est strictement limité aux équipes techniques de Lyvio.`,
  },
  {
    title: '5. Durée de conservation',
    body: `Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la suppression à tout moment en contactant contact@lyvio.eu. La suppression est effective sous 30 jours.`,
  },
  {
    title: '6. Vos droits',
    body: `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression, de portabilité et d'opposition au traitement de vos données. Pour exercer ces droits : contact@lyvio.eu.`,
  },
  {
    title: '7. Cookies',
    body: `Lyvio utilise uniquement des cookies techniques nécessaires au fonctionnement de l'application (session d'authentification). Aucun cookie de tracking ou publicitaire n'est utilisé.`,
  },
]

export default function ConfidentialitePage() {
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
          Politique de confidentialité
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
