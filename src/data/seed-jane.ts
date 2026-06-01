// Persona seed — Jane Doe · 30 ans · F
// Cohorte : Femmes actives 28-34 (n=2 140) · Âge bio 26 ans
export const jane = {
  profile: {
    name: 'Jane Doe',
    firstName: 'Jane',
    lastName: 'Doe',
    displayName: 'Jane D.',
    age: 30,
    height: 166,
    weight: 60,
    sex: 'F' as const,
    persona: 'Active',
    cohortLabel: 'F 28–34',
    cohortDetail: 'Femmes actives 28–34 · n=2 140',
  },

  bioAge: {
    value: 26,
    chronoAge: 30,
    delta: -4,
  },

  domains: [
    {
      id: 'bloodwork',
      name: 'Sang',
      color: 'amber' as const,
      score: 82,
      percentile: 82,
      warn: false,
      sub: 'Marqueurs excellents',
      trend: { label: '90 jours', value: '+3 pts', dir: 'up' as const },
      href: '/bloodwork',
    },
    {
      id: 'composition',
      name: 'Composition',
      color: 'lichen' as const,
      score: 85,
      percentile: 85,
      warn: false,
      sub: '21 % masse grasse · 47 kg maigre',
      trend: { label: '90 jours', value: '+2 pts', dir: 'up' as const },
      href: '/composition',
    },
    {
      id: 'aerobic',
      name: 'Capacité aérobie',
      color: 'aqua' as const,
      score: 78,
      percentile: 78,
      warn: false,
      sub: '44,5 mL/kg/min · top 22%',
      trend: { label: '90 jours', value: '+5 pts', dir: 'up' as const },
      href: '/aerobic',
    },
    {
      id: 'sleep',
      name: 'Sommeil & HRV',
      color: 'lavender' as const,
      score: 88,
      percentile: 88,
      warn: false,
      sub: '72 ms HRV · 93 % efficacité',
      trend: { label: '90 jours', value: '+3 pts', dir: 'up' as const },
      href: '/sleep',
    },
    {
      id: 'microbiome',
      name: 'Microbiote',
      color: 'amber' as const,
      score: 52,
      percentile: 52,
      warn: false,
      sub: 'Shannon 3,18 · diversité modérée',
      trend: { label: 'depuis oct 25', value: 'stable', dir: 'flat' as const },
      href: '/microbiome',
    },
  ],

  focus: [
    {
      id: 'vitd-protocol',
      dark: true,
      eyebrow: 'Protocole suggéré · 12 semaines',
      titleParts: ['Optimiser ta ', 'vitamine D', ' durablement.'],
      body: "Supplémentation 2 000–4 000 UI/j avec repas gras, bilan de contrôle à 3 mois. Exposition solaire quotidienne 15 min visage + avant-bras. Evidence A, effort minimal, impact majeur sur l'immunité et l'humeur.",
      tags: ['12 sem', 'Effort 1/5', 'Evidence A'],
      cta: 'Activer',
      href: '/bloodwork',
    },
    {
      id: 'cycle-bilan',
      dark: false,
      eyebrow: 'Mesure à programmer',
      titleParts: ['Cycle hormonal — ', 'bilan complet', ' J3.'],
      body: "Oestradiol, LH, FSH, progestérone, AMH. Permet de contextualiser la ferritine basse et les folates limites. Disponible en labo sur ordonnance ou en accès direct, ~120 €.",
      tags: ['~120 €', '1 fois/an'],
      cta: 'Planifier',
      href: '/bloodwork',
    },
  ],

  activity: [
    {
      id: 'bloodwork-mar',
      kind: 'blood' as const,
      kindLabel: 'Bilan sanguin',
      date: '12 mar',
      title: '37 marqueurs analysés · Eurofins',
      value: '35',
      unit: 'optimaux · 5 à surveiller',
      delta: 'Ferritine ↘ 3ᵉ bilan consécutif',
      deltaDir: 'down' as const,
    },
    {
      id: 'vo2-mar',
      kind: 'vo2' as const,
      kindLabel: 'VO₂max',
      date: '05 mar',
      title: 'Record personnel atteint',
      value: '44,5',
      unit: 'mL · kg⁻¹ · min⁻¹',
      delta: '+1,2 vs trimestre précédent',
      deltaDir: 'up' as const,
    },
    {
      id: 'sleep-feb',
      kind: 'sleep' as const,
      kindLabel: 'Récupération',
      date: '28 fév',
      title: 'HRV 72 ms — record perso',
      value: '72',
      unit: 'ms · moyenne 14 j',
      delta: '+7 ms sur 90 jours',
      deltaDir: 'up' as const,
    },
  ],

  syncSources: [
    { label: 'Oura', status: 'live' as const, detail: 'ce matin' },
    { label: 'Apple Watch', status: 'ok' as const, detail: '1 h' },
  ],

  // ─── Detail page data ────────────────────────────────────────────────────

  bloodworkHero: {
    optimal: 35,
    total: 40,
    cohortPercentile: 71,
    bilanDate: '12 mars 2026',
    pills: [
      { label: 'Lipides · excellent', ok: true },
      { label: 'Glycémie · 5,1% HbA1c', ok: true },
      { label: 'Fer · ferritine basse', ok: false },
      { label: 'Vitamines · D insuffisante', ok: false },
    ],
  },

  compositionData: {
    bodyAnnotations: { os: '2,8 kg', gras: '21,4%', muscle: '42,8 kg', eau: '64,8%' },
    stats: [
      { label: 'Poids', value: '60,0', unit: 'kg', sub: '−0,4 kg vs janv.', ok: true },
      { label: 'Masse grasse', value: '21,4', unit: '%', sub: '12,8 kg · objectif <18%', ok: false },
      { label: 'Masse maigre', value: '42,8', unit: 'kg', sub: '+0,8 kg en 6 mois', ok: true },
      { label: 'MB', value: '1 398', unit: 'kcal', sub: 'Métabolisme basal', ok: true },
    ],
    cohortPercentile: 82,
    bilanDate: '15 mai 2026',
    evolution: {
      dates: ['Déc 25', 'Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26'],
      musclePct: [70, 70, 71, 71, 71, 71],
      fatPct: [23, 23, 22, 22, 22, 21],
    },
  },

  aerobicData: {
    vo2Value: 44.5,
    cohortPercentile: 78,
    history: [40.2, 41.5, 42.8, 43.8, 44.5],
    historyDates: ['Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26'],
    zones: [
      { zone: 'Z1', name: 'Récupération', bpm: '< 115',    color: '#A8C5CD',                pct: 20 },
      { zone: 'Z2', name: 'Endurance',    bpm: '115–134',  color: 'var(--color-aqua)',       pct: 48 },
      { zone: 'Z3', name: 'Tempo',        bpm: '134–153',  color: 'var(--color-lichen)',     pct: 22 },
      { zone: 'Z4', name: 'Seuil',        bpm: '153–172',  color: 'var(--color-amber)',      pct: 8 },
      { zone: 'Z5', name: 'VO₂max',       bpm: '> 172',    color: 'var(--color-rust)',       pct: 2 },
    ],
  },

  sleepData: {
    kpis: [
      { label: 'HRV nocturne', value: '72',   unit: 'ms', sub: '+7 ms vs mois dernier', ok: true },
      { label: 'Efficacité',   value: '93',   unit: '%',  sub: 'Temps lit vs sommeil réel', ok: true },
      { label: 'FC repos',     value: '54',   unit: 'bpm', sub: 'Minimum nocturne', ok: true },
      { label: 'Durée moy.',   value: '7h28', unit: '',   sub: 'Sur 30 dernières nuits', ok: true },
    ],
    stages: [
      { label: 'Profond', pct: 24, color: 'var(--color-lavender)' },
      { label: 'REM',     pct: 26, color: 'var(--color-aqua)' },
      { label: 'Léger',   pct: 44, color: '#CFCFCF' },
      { label: 'Éveil',   pct: 6,  color: '#E8E8E4' },
    ],
    hrv: [65, 68, 70, 71, 72],
    hrvDates: ['Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26'],
    cohortPercentile: 88,
  },

  microbiomeData: {
    shannon: 3.18,
    fbRatio: 1.32,
    cohortPercentile: 52,
    phyla: [
      { name: 'Firmicutes',     pct: 48, color: '#D4A574' },
      { name: 'Bacteroidetes',  pct: 40, color: '#9890B5' },
      { name: 'Actinobacteria', pct: 7,  color: '#7BA8B5' },
      { name: 'Verrucomicrobia', pct: 4, color: '#9CB380' },
      { name: 'Autres',         pct: 1,  color: '#CFCFCF' },
    ],
    bacteria: [
      { name: 'Akkermansia muciniphila',    role: 'Barrière intestinale',   pct: 2.1,  status: 'optimal', color: '#9CB380' },
      { name: 'Faecalibacterium prausnitzii', role: 'Anti-inflammatoire',  pct: 7.2,  status: 'optimal', color: '#9CB380' },
      { name: 'Bifidobacterium longum',     role: 'Immunité · transit',    pct: 5.8,  status: 'optimal', color: '#9CB380' },
      { name: 'Lactobacillus reuteri',      role: 'Humeur · sérotonine',   pct: 0.6,  status: 'low',     color: '#D4A574' },
      { name: 'Prevotella copri',           role: 'Dysbiose · surveiller', pct: 1.8,  status: 'warn',    color: '#B5705A' },
    ],
  },
}
