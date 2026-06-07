import { C, serif } from './tokens'

// Inline SVG progress bar (track + lime fill). viewBox width is 0..100 so the
// value maps directly to the fill width — no generated images.
function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.onInkSoft }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <svg
        viewBox="0 0 100 5"
        preserveAspectRatio="none"
        width="100%"
        height="5"
        style={{ display: 'block', marginTop: 3 }}
        role="img"
        aria-label={`${label} : ${value} sur 100`}
      >
        <rect x="0" y="0" width="100" height="5" rx="2.5" fill={C.trackDark} />
        <rect x="0" y="0" width={value} height="5" rx="2.5" fill={C.lime} />
      </svg>
    </div>
  )
}

export default function ProductPreview() {
  return (
    <section style={{ margin: 18, backgroundColor: C.ink, borderRadius: 16, padding: 16 }}>
      <p style={{ margin: '0 0 12px', fontSize: 10, letterSpacing: '0.06em', color: C.lime }}>
        APERÇU DE TON TABLEAU DE BORD
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Bio-age dial */}
        <svg viewBox="0 0 90 90" width="78" height="78" role="img" aria-label="Âge biologique : 34 ans, soit 4 ans de moins que l'âge réel">
          <circle cx="45" cy="45" r="36" fill="none" stroke={C.trackDark} strokeWidth="8" />
          <circle
            cx="45" cy="45" r="36" fill="none" stroke={C.lime} strokeWidth="8"
            strokeLinecap="round" strokeDasharray="226" strokeDashoffset="70"
            transform="rotate(-90 45 45)"
          />
          <text x="45" y="42" textAnchor="middle" fontFamily={serif} fontSize="22" fontWeight="500" fill="#fff">34</text>
          <text x="45" y="56" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="7" fill={C.onInkSoft2}>BIO-ÂGE</text>
        </svg>

        {/* Domain scores */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <Bar label="Aérobie" value={82} />
          <Bar label="Métabolique" value={67} />
          <Bar label="Récupération" value={74} />
        </div>
      </div>
    </section>
  )
}
