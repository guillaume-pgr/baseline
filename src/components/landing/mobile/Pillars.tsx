import { IconUpload, IconChartArcs, IconBulb } from '@tabler/icons-react'
import { C } from './tokens'

const PILLARS = [
  {
    Icon: IconUpload,
    color: '#5FA02E',
    title: 'Importe',
    body: 'Prises de sang, objets connectés, mesures.',
  },
  {
    Icon: IconChartArcs,
    color: '#185FA5',
    title: 'Visualise',
    body: 'Tes tendances sur 5 domaines de santé.',
  },
  {
    Icon: IconBulb,
    color: '#534AB7',
    title: 'Comprends',
    body: 'Des explications claires, jamais de diagnostic.',
  },
]

export default function Pillars() {
  return (
    <section style={{ padding: '0 18px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, letterSpacing: '0.06em', color: C.inkSoft }}>
        CE QUE FAIT LYVIO
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PILLARS.map(({ Icon, color, title, body }) => (
          <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Icon size={20} color={color} stroke={1.6} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: C.ink }}>{title}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.inkSoft }}>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
