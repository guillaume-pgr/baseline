import DomainCard from './DomainCard'
import type { PersonaData } from '@/lib/context/PersonaContext'

type Props = {
  domains: PersonaData['domains']
  cohortLabel: PersonaData['profile']['cohortLabel']
}

export default function DomainsGrid({ domains, cohortLabel }: Props) {
  return (
    <section style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 12 }}>
        Domaines · Q2 2026
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.025em' }}>
          Où tu te situes <strong style={{ fontWeight: 700 }}>aujourd'hui</strong>
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.04em' }}>
          vs cohorte {cohortLabel}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 1,
        backgroundColor: 'var(--color-line)',
        border: '1px solid var(--color-line)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {domains.map((domain) => (
          <DomainCard key={domain.id} domain={domain} />
        ))}
      </div>
    </section>
  )
}
