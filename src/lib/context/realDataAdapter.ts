/**
 * Transforms real Supabase data into the exact same PersonaData shape as the demo seeds.
 * This ensures all display components work identically for real and demo data.
 */

import type { RealBloodPanelData } from './useRealBloodPanels'
import { MARKER_EXPLANATIONS, type BloodMarker, type BloodCategory } from '@/data/bloodwork-data'
import { matchMarker } from '@/lib/health/blood-markers-reference'

// ─── Marker name normalisation → explanation key ────────────────────────────

// Map common marker codes (from lab PDFs) to MARKER_EXPLANATIONS keys
const CODE_TO_KEY: Record<string, string> = {
  HGB: 'hemoglobine', HGBT: 'hemoglobine',
  HCT: 'hematocrite', WBC: 'leucocytes',
  PLT: 'plaquettes',  MCV: 'vgm',
  HDL: 'hdl',  HDLC: 'hdl',
  LDL: 'ldl',  LDLC: 'ldl',
  TG: 'tg',    TRIG: 'tg',
  CT_HDL: 'ct_hdl', CHOL_HDL: 'ct_hdl',
  GLU: 'glycemie', FGL: 'glycemie',
  HBA1C: 'hba1c',
  INS: 'insuline',
  AST: 'asat', ASAT: 'asat', GOT: 'asat',
  ALT: 'alat', ALAT: 'alat', GPT: 'alat',
  GGT: 'ggt',
  BILI: 'bili', BIL: 'bili',
  ALP: 'pal', PAL: 'pal',
  CREAT: 'creatinine', CREA: 'creatinine',
  GFR: 'dfg', DFG: 'dfg',
  UREA: 'uree', UREE: 'uree',
  UA: 'acide_urique', ACIDE_URIQUE: 'acide_urique',
  NA: 'sodium',
  K: 'potassium',
  CL: 'chlore',
  HCO3: 'bicarbonates',
  FERR: 'ferritine', FER_SERIQUE: 'ferritine',
  FE: 'fer', FER: 'fer',
  TSAT: 'sat_tf',
  CA: 'calcium',
  MG: 'magnesium',
  ZN: 'zinc',
  TSH: 'tsh',
  FT4: 't4l', T4L: 't4l',
  VITD: 'vitd', VIT_D: 'vitd',
  B12: 'vitb12', VITB12: 'vitb12',
  B9: 'folates', FOLATE: 'folates', FOLATES: 'folates',
  B6: 'vitb6', VITB6: 'vitb6',
  CRP: 'crp',
  FBG: 'fibrinogene',
  HCY: 'homocysteine',
}

function getExplanationKey(code: string, name: string): string {
  const byCode = CODE_TO_KEY[code?.toUpperCase()?.replace(/[\s\-\.]/g, '_')]
  if (byCode) return byCode

  // Normalise French name: lowercase, strip accents, replace non-alnum with _
  const normalized = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  return MARKER_EXPLANATIONS[normalized] ? normalized : code?.toLowerCase() ?? ''
}

// ─── Adapt a single DB marker → BloodMarker ──────────────────────────────────

function adaptMarker(
  m: {
    id: string; marker_code: string; marker_name: string
    value: number; unit: string
    ref_min: number | null; ref_max: number | null
    status: string | null; organ_system?: string | null
  },
  // One value per panel, oldest → newest (MODIF 4). Defaults to the single value.
  history: number[] = [m.value],
): BloodMarker {
  const rangeMin = m.ref_min ?? m.value * 0.6
  const rangeMax = m.ref_max ?? m.value * 1.4
  const mid = (rangeMin + rangeMax) / 2

  const warn = m.status === 'danger' || m.status === 'warning'
  const explanationKey = getExplanationKey(m.marker_code, m.marker_name)

  // Explanation: prefer the existing curated map, else fall back to the local
  // reference (MODIF 2) so every imported marker carries a wellness description.
  const explanation = MARKER_EXPLANATIONS[explanationKey]
    ?? matchMarker(m.marker_name)?.explanation
    ?? matchMarker(m.marker_code)?.explanation

  // Trend from first → last measurement across panels.
  const first = history[0]
  const last = history[history.length - 1]
  const trendDir: BloodMarker['trendDir'] = history.length < 2 || last === first
    ? 'flat'
    : last > first ? 'up' : 'down'
  const trendLabel = history.length < 2
    ? '→ 1 mesure'
    : `${history.length} mesures`

  return {
    id: explanationKey || m.marker_code?.toLowerCase(),
    explanation,
    name: m.marker_name,
    context: m.organ_system?.toLowerCase() ?? m.marker_code?.toLowerCase() ?? '',
    value: m.value,
    unit: m.unit ?? '',
    range: [rangeMin, rangeMax],
    scaleLabels: [
      String(rangeMin.toFixed(1)).replace('.', ','),
      String(mid.toFixed(1)).replace('.', ','),
      String(rangeMax.toFixed(1)).replace('.', ','),
    ],
    warn,
    trendDir,
    trendLabel,
    history,
  }
}

// ─── Group adapted markers into BloodCategory[] ──────────────────────────────

const GROUP_COLORS: Record<string, { iconColor: string; iconBg: string; chartColor: string }> = {
  hematologie: { iconColor: 'var(--color-rust)',     iconBg: 'var(--color-rust-soft)',     chartColor: '#B5705A' },
  hemostase:   { iconColor: 'var(--color-rust)',     iconBg: 'var(--color-rust-soft)',     chartColor: '#B5705A' },
  lipides:     { iconColor: 'var(--color-rust)',     iconBg: 'var(--color-rust-soft)',     chartColor: '#B5705A' },
  glucides:    { iconColor: 'var(--color-lichen)',   iconBg: 'var(--color-lichen-soft)',   chartColor: '#9CB380' },
  foie:        { iconColor: 'var(--color-amber)',    iconBg: 'var(--color-amber-soft)',    chartColor: '#D4A574' },
  pancreas:    { iconColor: 'var(--color-amber)',    iconBg: 'var(--color-amber-soft)',    chartColor: '#D4A574' },
  reins:       { iconColor: 'var(--color-aqua)',     iconBg: 'var(--color-aqua-soft)',     chartColor: '#7BA8B5' },
  thyroide:    { iconColor: 'var(--color-aqua)',     iconBg: 'var(--color-aqua-soft)',     chartColor: '#7BA8B5' },
  vitamines:   { iconColor: 'var(--color-amber)',    iconBg: 'var(--color-amber-soft)',    chartColor: '#D4A574' },
  mineraux:    { iconColor: 'var(--color-lichen)',   iconBg: 'var(--color-lichen-soft)',   chartColor: '#9CB380' },
  inflammation:{ iconColor: 'var(--color-lavender)', iconBg: 'var(--color-lavender-soft)', chartColor: '#9890B5' },
  hormones:    { iconColor: 'var(--color-lavender)', iconBg: 'var(--color-lavender-soft)', chartColor: '#9890B5' },
  cardiaque:   { iconColor: 'var(--color-rust)',     iconBg: 'var(--color-rust-soft)',     chartColor: '#B5705A' },
  default:     { iconColor: 'var(--color-lavender)', iconBg: 'var(--color-lavender-soft)', chartColor: '#9890B5' },
}

// Libellés lisibles (avec accents) pour les catégories du référentiel.
const CATEGORY_LABELS: Record<string, string> = {
  hematologie: 'Hématologie',
  hemostase: 'Hémostase',
  lipides: 'Lipides',
  glucides: 'Glucides',
  foie: 'Foie',
  pancreas: 'Pancréas',
  reins: 'Reins',
  thyroide: 'Thyroïde',
  vitamines: 'Vitamines',
  mineraux: 'Minéraux',
  inflammation: 'Inflammation',
  hormones: 'Hormones',
  cardiaque: 'Cardiaque',
}

function buildCategories(rawMarkers: RealBloodPanelData['markers'], adapted: BloodMarker[]): BloodCategory[] {
  const groups = new Map<string, { raw: typeof rawMarkers[0][]; adapted: BloodMarker[] }>()

  rawMarkers.forEach((m, i) => {
    const key = m.organ_system?.toLowerCase() ?? 'autres'
    if (!groups.has(key)) groups.set(key, { raw: [], adapted: [] })
    groups.get(key)!.raw.push(m)
    groups.get(key)!.adapted.push(adapted[i])
  })

  return Array.from(groups.entries()).map(([key, { raw, adapted: aMarkers }]) => {
    const warnCount = raw.filter(m => m.status === 'warning' || m.status === 'danger').length
    const c = GROUP_COLORS[key] ?? GROUP_COLORS.default
    const groupName = CATEGORY_LABELS[key] ?? (key.charAt(0).toUpperCase() + key.slice(1))
    return {
      id: key.replace(/[^a-z0-9]/g, '_'),
      name: groupName,
      iconColor: c.iconColor,
      iconBg: c.iconBg,
      status: (warnCount === 0 ? 'ok' : 'warn') as 'ok' | 'warn',
      statusLabel: warnCount === 0 ? 'tout optimal' : `${warnCount} à surveiller`,
      chartTitle: `${groupName} — évolution`,
      chartColor: c.chartColor,
      chartMarkerIds: aMarkers.length > 0 ? [aMarkers[0].id] : [],
      markers: aMarkers,
    }
  })
}

// ─── Build bloodworkHero pills ─────────────────────────────────────────────────

function buildPills(raw: RealBloodPanelData['markers']): { label: string; ok: boolean }[] {
  const pills: { label: string; ok: boolean }[] = []
  const groups = new Map<string, { ok: number; total: number }>()
  raw.forEach(m => {
    const key = m.organ_system?.toLowerCase() ?? 'autre'
    if (!groups.has(key)) groups.set(key, { ok: 0, total: 0 })
    const g = groups.get(key)!
    g.total++
    if (m.status === 'optimal') g.ok++
  })
  groups.forEach((v, key) => {
    const name = key.charAt(0).toUpperCase() + key.slice(1)
    pills.push({ label: `${name} · ${v.ok === v.total ? 'optimal' : `${v.total - v.ok} à surveiller`}`, ok: v.ok === v.total })
  })
  return pills.slice(0, 4)
}

// ─── Build empty domain (no data yet) ─────────────────────────────────────────

function emptyDomain(id: string, name: string, color: 'rust' | 'lichen' | 'aqua' | 'lavender' | 'amber', href: string) {
  return {
    id, name, color, score: 0, percentile: 0, warn: false,
    sub: 'Connecte tes données',
    trend: { label: '', value: '—', dir: 'flat' as const },
    href,
  }
}

// ─── Main adapter ─────────────────────────────────────────────────────────────

export function adaptRealData(profile: any, panels: RealBloodPanelData[]) {
  // All panels, oldest → newest, for the evolution charts (MODIF 4).
  const sorted = [...panels].sort((a, b) => a.panel.panel_date.localeCompare(b.panel.panel_date))
  const latest = sorted[sorted.length - 1]
  const raw    = latest?.markers ?? []

  // Normalised identity to match a marker across panels.
  const idOf = (code?: string | null, name?: string | null) =>
    (code || name || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

  // value-by-marker lookup for each panel (oldest → newest)
  const panelValues = sorted.map(p => {
    const map = new Map<string, number>()
    p.markers.forEach(mk => map.set(idOf(mk.marker_code, mk.marker_name), mk.value))
    return map
  })

  // Build a marker's time series across panels; gaps are filled by carry-forward
  // (and leading gaps by the first known value) so the line never breaks.
  function historyFor(m: { marker_code: string; marker_name: string; value: number }): number[] {
    const key = idOf(m.marker_code, m.marker_name)
    const rawVals = panelValues.map(map => (map.has(key) ? map.get(key)! : null))
    const firstKnown = rawVals.find(v => v !== null) ?? m.value
    let last: number | null = null
    return rawVals.map(v => {
      if (v !== null) last = v
      return last ?? firstKnown
    })
  }

  // Adapt markers (latest panel = current values; history spans all panels)
  const adapted = raw.map(m => adaptMarker(m, historyFor(m)))
  const categories = buildCategories(raw, adapted)

  // Scores
  const optimal = raw.filter(m => m.status === 'optimal').length
  const total   = raw.length
  const bloodScore = total > 0 ? Math.round((optimal / total) * 100) : 0

  // Chrono age from birth_date
  const birthMs = profile?.birth_date ? Date.parse(profile.birth_date) : null
  const chronoAge = birthMs ? Math.floor((Date.now() - birthMs) / 31_557_600_000) : 30

  // Bio age: blood score proxy (100% → -5 years, 50% → 0, 0% → +5 years)
  const bioAgeDelta = Math.round((bloodScore - 50) / 10)
  const bioAgeValue = Math.max(chronoAge - bioAgeDelta, 18)

  // Names
  const firstName = profile?.first_name ?? 'Toi'
  const lastName  = profile?.last_name  ?? ''
  const sex       = profile?.sex ?? 'M'
  const cohortMin = Math.max(chronoAge - 2, 18)
  const cohortMax = chronoAge + 4

  // Panel date
  const panelDate = latest
    ? new Date(latest.panel.panel_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  // One x-axis label per panel (oldest → newest), aligned with marker histories.
  const bloodworkDates = sorted.map(p =>
    new Date(p.panel.panel_date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
  )

  return {
    profile: {
      name:         `${firstName} ${lastName}`.trim(),
      firstName,
      lastName:     lastName || null,
      displayName:  `${firstName}${lastName ? ' ' + lastName.charAt(0) + '.' : ''}`,
      age:          chronoAge,
      height:       profile?.height_cm ?? 175,
      weight:       0,
      sex,
      persona:      'Mes données',
      cohortLabel:  `${sex} ${cohortMin}–${cohortMax}`,
      cohortDetail: `${sex === 'M' ? 'Hommes' : 'Femmes'} ${cohortMin}–${cohortMax}`,
    },

    bioAge: {
      value:      bioAgeValue,
      chronoAge,
      delta:      bioAgeValue - chronoAge,
    },

    domains: [
      {
        id: 'bloodwork', name: 'Sang', color: 'rust' as const,
        score: bloodScore, percentile: bloodScore, warn: bloodScore < 50,
        sub: total > 0 ? `${optimal}/${total} marqueurs optimaux` : 'Pas de données',
        trend: { label: panelDate, value: `${bloodScore}/100`, dir: 'flat' as const },
        href: '/bloodwork',
      },
      emptyDomain('composition', 'Composition',    'lichen',   '/composition'),
      emptyDomain('aerobic',     'Capacité aérobie', 'aqua',   '/aerobic'),
      emptyDomain('sleep',       'Sommeil & HRV',  'lavender', '/sleep'),
      emptyDomain('microbiome',  'Microbiote',     'amber',    '/microbiome'),
    ],

    focus:       [],
    activity:    [],
    syncSources: [],

    bloodworkHero: {
      optimal,
      total,
      cohortPercentile: bloodScore,
      bilanDate: panelDate,
      pills: buildPills(raw),
    },

    compositionData: null as null,
    aerobicData:     null as null,
    sleepData:       null as null,
    microbiomeData:  null as null,

    pageSummaries: {
      bloodwork: total > 0
        ? `Bilan du ${panelDate} : ${optimal} marqueurs sur ${total} dans la zone optimale (${bloodScore}%).`
        : `Aucun bilan sanguin importé.`,
      composition: `Connecte une balance pour voir ta composition corporelle.`,
      aerobic:     `Connecte une montre pour voir ta VO₂max et tes zones cardio.`,
      sleep:       `Connecte un appareil de suivi pour voir ton sommeil et ta HRV.`,
      microbiome:  `Importe les résultats d'un test microbiote pour les voir ici.`,
    },

    bloodwork: {
      optimal,
      total,
      cohortPercentile: bloodScore,
      bilanDate: panelDate,
      pills: buildPills(raw),
      categories,
      dates: bloodworkDates,
    },
  }
}
