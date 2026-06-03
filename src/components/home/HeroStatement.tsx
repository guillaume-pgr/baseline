import BioAgeDial from './BioAgeDial'
import type { PersonaData } from '@/lib/context/PersonaContext'

type Props = {
  bioAge: PersonaData['bioAge']
}

export default function HeroStatement({ bioAge }: Props) {

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 64,
      alignItems: 'center',
      marginBottom: 72,
    }}>
      <div>
        <h1 style={{
          fontSize: 56,
          fontWeight: 200,
          lineHeight: 1.0,
          letterSpacing: '-0.04em',
          color: 'var(--color-ink)',
          marginBottom: 28,
          maxWidth: 540,
        }}>
          Biologiquement,<br />
          tu as{' '}
          <em style={{ fontStyle: 'normal', position: 'relative', whiteSpace: 'nowrap' }}>
            <strong style={{ fontWeight: 700 }}>
              {bioAge.value.toString().replace('.', ',')} ans
            </strong>
            <span style={{
              position: 'absolute',
              left: 0, right: 0,
              bottom: 4,
              height: 14,
              backgroundColor: 'var(--color-lichen-soft)',
              zIndex: -1,
            }} />
          </em>
          .
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--color-ink-3)',
          maxWidth: 460,
          lineHeight: 1.6,
        }}>
          Composite de 5 domaines biomarqueurs — sang, composition, aérobie,
          sommeil, microbiote — normalisé sur 2 840 hommes actifs de 28–34 ans.
        </p>
      </div>

      <BioAgeDial
        value={bioAge.value}
        chronoAge={bioAge.chronoAge}
        delta={bioAge.delta}
      />
    </section>
  )
}
