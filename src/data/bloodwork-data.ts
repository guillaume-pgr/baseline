// Bloodwork seed data — 5 bilans : oct24, mar25, sep25, jan26, mar26
export const BILAN_DATES = ['Oct 24', 'Mar 25', 'Sep 25', 'Jan 26', 'Mar 26'] as const
export const BILAN_DATES_LONG = ['oct. 2024', 'mars 2025', 'sep. 2025', 'jan. 2026', 'mars 2026'] as const

export type MarkerTrendDir = 'up' | 'down' | 'flat'
export type MarkerStatus = 'ok' | 'warn'

export type BloodMarker = {
  id: string
  name: string
  context: string
  value: number
  unit: string
  range: [number, number]
  scaleLabels: [string, string, string]
  warn: boolean
  trendDir: MarkerTrendDir
  trendLabel: string
  history: [number, number, number, number, number]
}

export type BloodCategory = {
  id: string
  name: string
  iconColor: string
  iconBg: string
  status: MarkerStatus
  statusLabel: string
  chartTitle: string
  chartColor: string
  chartMarkerIds: string[]
  markers: BloodMarker[]
}

export const bloodCategories: BloodCategory[] = [
  // ─── 1. HÉMATOLOGIE ───────────────────────────────────────────────────────
  {
    id: 'hematologie',
    name: 'Hématologie',
    iconColor: 'var(--color-rust)',
    iconBg: 'var(--color-rust-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Hémoglobine & hématocrite — 18 mois',
    chartColor: '#B5705A',
    chartMarkerIds: ['hemoglobine', 'hematocrite'],
    markers: [
      { id: 'hemoglobine',  name: 'Hémoglobine',   context: 'transport O₂',         value: 15.2, unit: 'g/dL',  range: [11, 18],   scaleLabels: ['11', '14.5', '18'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',         history: [15.0, 15.2, 15.1, 15.3, 15.2] },
      { id: 'hematocrite',  name: 'Hématocrite',   context: 'volume globulaire',     value: 45,   unit: '%',    range: [35, 55],   scaleLabels: ['35', '45', '55 %'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',         history: [44,   44.5, 45,   45,   45] },
      { id: 'leucocytes',   name: 'Leucocytes',    context: 'globules blancs',       value: 5.8,  unit: 'G/L',  range: [3, 12],    scaleLabels: ['3', '7', '12 G/L'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',         history: [5.5,  5.8,  5.6,  6.0,  5.8] },
      { id: 'plaquettes',   name: 'Plaquettes',    context: 'coagulation',           value: 245,  unit: 'G/L',  range: [100, 450], scaleLabels: ['100', '250', '450'],   warn: false, trendDir: 'flat', trendLabel: '→ stable',         history: [240,  248,  244,  250,  245] },
      { id: 'vgm',          name: 'VGM',           context: 'volume globulaire moyen', value: 88,  unit: 'fL',  range: [75, 105],  scaleLabels: ['75', '90', '105 fL'],  warn: false, trendDir: 'flat', trendLabel: '→ stable',         history: [87,   88,   88,   87,   88] },
    ],
  },

  // ─── 2. LIPIDES ──────────────────────────────────────────────────────────
  {
    id: 'lipides',
    name: 'Profil lipidique',
    iconColor: 'var(--color-rust)',
    iconBg: 'var(--color-rust-soft)',
    status: 'warn',
    statusLabel: '2 à surveiller',
    chartTitle: 'Évolution lipides — 18 mois',
    chartColor: '#B5705A',
    chartMarkerIds: ['hdl', 'ldl', 'tg'],
    markers: [
      { id: 'hdl',      name: 'HDL cholestérol',       context: 'cardio · « bon » cholestérol', value: 0.39, unit: 'g/L',  range: [0.25, 0.80], scaleLabels: ['0,30', '0,50', '0,70'],   warn: true,  trendDir: 'down', trendLabel: '↘ −0,07 vs 2024', history: [0.46, 0.43, 0.41, 0.40, 0.39] },
      { id: 'ldl',      name: 'LDL cholestérol',       context: 'cardio · « mauvais » cholestérol', value: 1.49, unit: 'g/L', range: [0.50, 1.80], scaleLabels: ['0,60', '1,15', '1,55'], warn: true,  trendDir: 'up',   trendLabel: '↗ +0,17 vs 2024', history: [1.32, 1.38, 1.42, 1.45, 1.49] },
      { id: 'tg',       name: 'Triglycérides',         context: 'cardio · graisses circulantes', value: 0.72, unit: 'g/L',  range: [0.30, 2.00], scaleLabels: ['0,40', '1,00', '1,60'],   warn: false, trendDir: 'down', trendLabel: '↘ −0,12 vs 2024', history: [0.84, 0.81, 0.78, 0.75, 0.72] },
      { id: 'ct_hdl',   name: 'Cholestérol total / HDL', context: 'cardio · ratio', value: 5.18, unit: 'ratio', range: [1.5, 7.0], scaleLabels: ['2,0', '3,5', '5,0'],     warn: true,  trendDir: 'up',   trendLabel: '↗ +0,9 vs 2024',  history: [4.28, 4.56, 4.80, 4.95, 5.18] },
    ],
  },

  // ─── 3. MÉTABOLISME GLUCIDIQUE ────────────────────────────────────────────
  {
    id: 'glucides',
    name: 'Métabolisme glucidique',
    iconColor: 'var(--color-lichen)',
    iconBg: 'var(--color-lichen-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Glycémie & HbA1c — 18 mois',
    chartColor: '#9CB380',
    chartMarkerIds: ['glycemie', 'hba1c'],
    markers: [
      { id: 'glycemie', name: 'Glycémie à jeun', context: 'métabolisme', value: 0.84, unit: 'g/L', range: [0.60, 1.30], scaleLabels: ['0,70', '0,90', '1,10'], warn: false, trendDir: 'flat', trendLabel: '→ stable',  history: [0.85, 0.84, 0.83, 0.84, 0.84] },
      { id: 'hba1c',    name: 'HbA1c',           context: 'métabolisme · 3 mois', value: 5.3, unit: '%', range: [4.0, 7.0], scaleLabels: ['4,0', '5,0', '6,0 %'], warn: false, trendDir: 'flat', trendLabel: '→ stable',  history: [5.4, 5.3, 5.3, 5.2, 5.3] },
      { id: 'insuline', name: 'Insuline à jeun',  context: 'résistance insuline', value: 4.8, unit: 'µUI/mL', range: [2, 25], scaleLabels: ['2', '10', '25'],       warn: false, trendDir: 'flat', trendLabel: '→ stable',  history: [5.0, 4.9, 5.1, 4.8, 4.8] },
    ],
  },

  // ─── 4. FOIE ──────────────────────────────────────────────────────────────
  {
    id: 'foie',
    name: 'Bilan hépatique',
    iconColor: 'var(--color-amber)',
    iconBg: 'var(--color-amber-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Transaminases — 18 mois',
    chartColor: '#D4A574',
    chartMarkerIds: ['asat', 'alat', 'ggt'],
    markers: [
      { id: 'asat',  name: 'ASAT (GOT)',          context: 'enzyme hépatique',  value: 28,  unit: 'UI/L',   range: [5, 60],   scaleLabels: ['5', '25', '50'],     warn: false, trendDir: 'flat', trendLabel: '→ stable',   history: [26, 28, 27, 29, 28] },
      { id: 'alat',  name: 'ALAT (GPT)',          context: 'enzyme hépatique',  value: 22,  unit: 'UI/L',   range: [5, 60],   scaleLabels: ['5', '25', '50'],     warn: false, trendDir: 'flat', trendLabel: '→ stable',   history: [24, 22, 23, 21, 22] },
      { id: 'ggt',   name: 'GGT',                context: 'alcool, médicaments', value: 18,  unit: 'UI/L',  range: [5, 80],   scaleLabels: ['5', '30', '65'],     warn: false, trendDir: 'flat', trendLabel: '→ stable',   history: [20, 19, 18, 18, 18] },
      { id: 'bili',  name: 'Bilirubine totale',   context: 'métabolisme hème',   value: 0.8, unit: 'mg/dL', range: [0.1, 2.0], scaleLabels: ['0,2', '0,8', '1,5'], warn: false, trendDir: 'flat', trendLabel: '→ stable',   history: [0.9, 0.8, 0.8, 0.7, 0.8] },
      { id: 'pal',   name: 'Phosphatases alcalines', context: 'foie et os',    value: 65,  unit: 'UI/L',   range: [30, 150], scaleLabels: ['30', '85', '140'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',   history: [68, 65, 66, 64, 65] },
    ],
  },

  // ─── 5. REINS ─────────────────────────────────────────────────────────────
  {
    id: 'reins',
    name: 'Bilan rénal',
    iconColor: 'var(--color-aqua)',
    iconBg: 'var(--color-aqua-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Créatinine & DFG — 18 mois',
    chartColor: '#7BA8B5',
    chartMarkerIds: ['creatinine', 'dfg'],
    markers: [
      { id: 'creatinine', name: 'Créatinine',    context: 'filtration glomérulaire', value: 0.95, unit: 'mg/dL', range: [0.5, 1.5],  scaleLabels: ['0,5', '1,0', '1,5'],   warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [0.92, 0.94, 0.95, 0.93, 0.95] },
      { id: 'dfg',        name: 'DFG estimé (CKD-EPI)', context: 'fonction rénale', value: 102, unit: 'mL/min', range: [40, 130], scaleLabels: ['40', '90', '130'],      warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [104, 103, 102, 103, 102] },
      { id: 'uree',       name: 'Urée',          context: 'déchet azoté',            value: 38,   unit: 'mg/dL', range: [10, 60],   scaleLabels: ['15', '35', '55'],      warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [40, 38, 39, 37, 38] },
      { id: 'acide_urique', name: 'Acide urique', context: 'catabolisme purines',   value: 5.8,  unit: 'mg/dL', range: [2.5, 8.5], scaleLabels: ['3,0', '5,5', '8,0'],   warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [5.5, 5.6, 5.7, 5.8, 5.8] },
    ],
  },

  // ─── 6. IONOGRAMME ────────────────────────────────────────────────────────
  {
    id: 'ionogramme',
    name: 'Ionogramme sanguin',
    iconColor: 'var(--color-lavender)',
    iconBg: 'var(--color-lavender-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Sodium & potassium — 18 mois',
    chartColor: '#9890B5',
    chartMarkerIds: ['sodium', 'potassium'],
    markers: [
      { id: 'sodium',      name: 'Sodium',      context: 'équilibre hydrique',  value: 140,  unit: 'mEq/L', range: [130, 150], scaleLabels: ['132', '141', '148'],  warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [139, 140, 141, 140, 140] },
      { id: 'potassium',   name: 'Potassium',   context: 'activité musculaire', value: 4.2,  unit: 'mEq/L', range: [3.0, 6.0], scaleLabels: ['3,5', '4,5', '5,5'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [4.1, 4.2, 4.2, 4.3, 4.2] },
      { id: 'chlore',      name: 'Chlore',      context: 'équilibre acido-basique', value: 102, unit: 'mEq/L', range: [95, 115], scaleLabels: ['95', '103', '112'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [101, 102, 103, 102, 102] },
      { id: 'bicarbonates', name: 'Bicarbonates', context: 'pH sanguin',        value: 24,   unit: 'mEq/L', range: [18, 32],   scaleLabels: ['18', '25', '32'],    warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [24, 24, 23, 24, 24] },
    ],
  },

  // ─── 7. BILAN MARTIAL ─────────────────────────────────────────────────────
  {
    id: 'martial',
    name: 'Bilan martial (fer)',
    iconColor: 'var(--color-rust)',
    iconBg: 'var(--color-rust-soft)',
    status: 'ok',
    statusLabel: 'optimal',
    chartTitle: 'Ferritine — 18 mois',
    chartColor: '#B5705A',
    chartMarkerIds: ['ferritine'],
    markers: [
      { id: 'ferritine', name: 'Ferritine',              context: 'réserves de fer',         value: 82,  unit: 'µg/L', range: [10, 200], scaleLabels: ['10', '80', '200'],    warn: false, trendDir: 'up',   trendLabel: '↗ +12 vs 2024', history: [70, 74, 77, 80, 82] },
      { id: 'fer',       name: 'Fer sérique',            context: 'transport du fer',         value: 18,  unit: 'µmol/L', range: [8, 35], scaleLabels: ['8', '20', '35'],      warn: false, trendDir: 'flat', trendLabel: '→ stable',     history: [17, 18, 17, 18, 18] },
      { id: 'sat_tf',    name: 'Saturation transferrine', context: 'disponibilité du fer',   value: 28,  unit: '%',    range: [10, 60], scaleLabels: ['10', '30', '55 %'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',     history: [26, 27, 28, 27, 28] },
    ],
  },

  // ─── 8. MINÉRAUX ──────────────────────────────────────────────────────────
  {
    id: 'mineraux',
    name: 'Minéraux',
    iconColor: 'var(--color-lichen)',
    iconBg: 'var(--color-lichen-soft)',
    status: 'ok',
    statusLabel: 'tout optimal',
    chartTitle: 'Magnésium & zinc — 18 mois',
    chartColor: '#9CB380',
    chartMarkerIds: ['magnesium', 'zinc'],
    markers: [
      { id: 'calcium',   name: 'Calcium',   context: 'os, contraction musculaire', value: 2.40, unit: 'mmol/L', range: [2.0, 3.0], scaleLabels: ['2,0', '2,5', '3,0'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [2.42, 2.41, 2.40, 2.39, 2.40] },
      { id: 'magnesium', name: 'Magnésium', context: 'énergie, muscle, sommeil',   value: 0.82, unit: 'mmol/L', range: [0.60, 1.10], scaleLabels: ['0,60', '0,85', '1,10'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [0.80, 0.81, 0.82, 0.82, 0.82] },
      { id: 'zinc',      name: 'Zinc',      context: 'immunité, testostérone',     value: 14,   unit: 'µmol/L', range: [8, 22], scaleLabels: ['8', '14', '22'],         warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [13, 14, 14, 14, 14] },
    ],
  },

  // ─── 9. THYROÏDE ──────────────────────────────────────────────────────────
  {
    id: 'thyroide',
    name: 'Thyroïde',
    iconColor: 'var(--color-aqua)',
    iconBg: 'var(--color-aqua-soft)',
    status: 'ok',
    statusLabel: 'optimal',
    chartTitle: 'TSH — 18 mois',
    chartColor: '#7BA8B5',
    chartMarkerIds: ['tsh'],
    markers: [
      { id: 'tsh', name: 'TSH',    context: 'activité thyroïdienne', value: 1.8,  unit: 'mUI/L', range: [0.2, 5.5], scaleLabels: ['0,2', '2,5', '5,5'],  warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [1.9, 1.8, 1.8, 1.7, 1.8] },
      { id: 't4l', name: 'T4 libre', context: 'hormone thyroïdienne', value: 1.4, unit: 'ng/dL', range: [0.7, 2.0], scaleLabels: ['0,7', '1,4', '2,0'],   warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [1.4, 1.4, 1.3, 1.4, 1.4] },
    ],
  },

  // ─── 10. VITAMINES ────────────────────────────────────────────────────────
  {
    id: 'vitamines',
    name: 'Vitamines',
    iconColor: 'var(--color-amber)',
    iconBg: 'var(--color-amber-soft)',
    status: 'ok',
    statusLabel: 'à surveiller (D)',
    chartTitle: 'Vitamine D & B12 — 18 mois',
    chartColor: '#D4A574',
    chartMarkerIds: ['vitd', 'vitb12'],
    markers: [
      { id: 'vitd',  name: 'Vitamine D (25-OH)', context: 'immunité, os, humeur', value: 42,  unit: 'ng/mL', range: [10, 80], scaleLabels: ['10', '40', '80'],          warn: false, trendDir: 'up',   trendLabel: '↗ +8 vs 2024',   history: [34, 36, 40, 41, 42] },
      { id: 'vitb12', name: 'Vitamine B12',      context: 'neurologie, globules', value: 385, unit: 'pg/mL', range: [150, 800], scaleLabels: ['150', '450', '800'],     warn: false, trendDir: 'flat', trendLabel: '→ stable',       history: [390, 385, 382, 388, 385] },
      { id: 'folates', name: 'Folates (B9)',      context: 'synthèse ADN',        value: 14,  unit: 'nmol/L', range: [4, 25], scaleLabels: ['4', '12', '24'],           warn: false, trendDir: 'flat', trendLabel: '→ stable',       history: [14, 13, 14, 14, 14] },
      { id: 'vitb6',  name: 'Vitamine B6',       context: 'neurotransmetteurs',   value: 22,  unit: 'µg/L',  range: [3, 60], scaleLabels: ['3', '25', '55'],           warn: false, trendDir: 'flat', trendLabel: '→ stable',       history: [21, 22, 22, 22, 22] },
    ],
  },

  // ─── 11. INFLAMMATION ─────────────────────────────────────────────────────
  {
    id: 'inflammation',
    name: 'Inflammation',
    iconColor: 'var(--color-lavender)',
    iconBg: 'var(--color-lavender-soft)',
    status: 'ok',
    statusLabel: 'optimal',
    chartTitle: 'CRP us — 18 mois',
    chartColor: '#9890B5',
    chartMarkerIds: ['crp'],
    markers: [
      { id: 'crp',          name: 'CRP ultra-sensible', context: 'inflammation systémique', value: 0.6,  unit: 'mg/L',   range: [0, 5],    scaleLabels: ['0', '2,5', '5'],      warn: false, trendDir: 'down', trendLabel: '↘ −0,4 vs 2024', history: [1.0, 0.9, 0.8, 0.7, 0.6] },
      { id: 'fibrinogene',  name: 'Fibrinogène',        context: 'coagulation, infection',  value: 2.8,  unit: 'g/L',    range: [1.5, 5],  scaleLabels: ['1,5', '3,0', '5,0'], warn: false, trendDir: 'flat', trendLabel: '→ stable',       history: [2.9, 2.8, 2.8, 2.8, 2.8] },
      { id: 'homocysteine', name: 'Homocystéine',       context: 'risque cardiovasculaire', value: 10.2, unit: 'µmol/L', range: [4, 20],   scaleLabels: ['4', '10', '20'],      warn: false, trendDir: 'flat', trendLabel: '→ stable',       history: [10.5, 10.3, 10.2, 10.2, 10.2] },
    ],
  },
]
