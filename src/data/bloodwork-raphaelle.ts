// Bloodwork seed data — Raphaëlle · 5 bilans : oct24, mar25, sep25, jan26, mar26
// 40 marqueurs · 5 en limite : ferritine, sat. transferrine, chlore, vitD, folates
import type { BloodCategory } from './bloodwork-data'

export const BILAN_DATES_R = ['Oct 24', 'Mar 25', 'Sep 25', 'Jan 26', 'Mar 26'] as const

export const bloodCategoriesR: BloodCategory[] = [
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
      { id: 'hemoglobine',  name: 'Hémoglobine',   context: 'transport O₂',             value: 13.8, unit: 'g/dL',  range: [10, 17],   scaleLabels: ['10', '13.5', '17'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',        history: [13.6, 13.8, 13.9, 13.8, 13.8] },
      { id: 'hematocrite',  name: 'Hématocrite',   context: 'volume globulaire',         value: 42,   unit: '%',    range: [33, 48],   scaleLabels: ['33', '41', '48 %'],    warn: false, trendDir: 'up',   trendLabel: '↗ +2 vs oct 24',  history: [40,   41,   41,   42,   42] },
      { id: 'leucocytes',   name: 'Leucocytes',    context: 'globules blancs',           value: 6.2,  unit: 'G/L',  range: [3, 12],    scaleLabels: ['3', '7', '12 G/L'],    warn: false, trendDir: 'flat', trendLabel: '→ stable',        history: [6.0,  6.2,  6.1,  6.3,  6.2] },
      { id: 'plaquettes',   name: 'Plaquettes',    context: 'coagulation',               value: 270,  unit: 'G/L',  range: [100, 450], scaleLabels: ['100', '250', '450'],   warn: false, trendDir: 'flat', trendLabel: '→ stable',        history: [265,  270,  268,  272,  270] },
      { id: 'vgm',          name: 'VGM',           context: 'volume globulaire moyen',   value: 86,   unit: 'fL',   range: [75, 105],  scaleLabels: ['75', '90', '105 fL'],  warn: false, trendDir: 'flat', trendLabel: '→ stable',        history: [85,   85,   86,   86,   86] },
    ],
  },

  // ─── 2. LIPIDES ──────────────────────────────────────────────────────────
  {
    id: 'lipides',
    name: 'Profil lipidique',
    iconColor: 'var(--color-lichen)',
    iconBg: 'var(--color-lichen-soft)',
    status: 'ok',
    statusLabel: 'excellent',
    chartTitle: 'Évolution lipides — 18 mois',
    chartColor: '#9CB380',
    chartMarkerIds: ['hdl', 'ldl'],
    markers: [
      { id: 'hdl',    name: 'HDL cholestérol',          context: 'cardio · « bon » cholestérol',   value: 0.68, unit: 'g/L',   range: [0.30, 0.90], scaleLabels: ['0,30', '0,60', '0,90'],  warn: false, trendDir: 'up',   trendLabel: '↗ +0,06 vs 2024', history: [0.62, 0.64, 0.66, 0.67, 0.68] },
      { id: 'ldl',    name: 'LDL cholestérol',          context: 'cardio · « mauvais » cholestérol', value: 1.12, unit: 'g/L', range: [0.50, 1.80], scaleLabels: ['0,60', '1,15', '1,55'], warn: false, trendDir: 'down', trendLabel: '↘ −0,06 vs 2024', history: [1.18, 1.16, 1.15, 1.13, 1.12] },
      { id: 'tg',     name: 'Triglycérides',            context: 'cardio · graisses circulantes', value: 0.85,  unit: 'g/L',  range: [0.30, 2.00], scaleLabels: ['0,40', '1,00', '1,60'],  warn: false, trendDir: 'down', trendLabel: '↘ −0,07 vs 2024', history: [0.92, 0.90, 0.88, 0.86, 0.85] },
      { id: 'ct_hdl', name: 'Cholestérol total / HDL', context: 'cardio · ratio',                value: 3.22,  unit: 'ratio', range: [1.5, 7.0], scaleLabels: ['2,0', '3,5', '5,0'],     warn: false, trendDir: 'down', trendLabel: '↘ −0,26 vs 2024', history: [3.48, 3.38, 3.30, 3.25, 3.22] },
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
      { id: 'glycemie', name: 'Glycémie à jeun', context: 'métabolisme', value: 0.82, unit: 'g/L', range: [0.60, 1.30], scaleLabels: ['0,70', '0,90', '1,10'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [0.83, 0.82, 0.82, 0.81, 0.82] },
      { id: 'hba1c',    name: 'HbA1c',           context: 'métabolisme · 3 mois', value: 5.1, unit: '%', range: [4.0, 7.0], scaleLabels: ['4,0', '5,0', '6,0 %'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [5.2, 5.1, 5.1, 5.1, 5.1] },
      { id: 'insuline', name: 'Insuline à jeun',  context: 'résistance insuline', value: 5.5, unit: 'µUI/mL', range: [2, 25], scaleLabels: ['2', '10', '25'],    warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [5.8, 5.6, 5.5, 5.5, 5.5] },
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
      { id: 'asat', name: 'ASAT (GOT)',             context: 'enzyme hépatique',      value: 20,  unit: 'UI/L',   range: [5, 45],   scaleLabels: ['5', '22', '45'],     warn: false, trendDir: 'down', trendLabel: '↘ −2 vs 2024', history: [22, 21, 20, 20, 20] },
      { id: 'alat', name: 'ALAT (GPT)',             context: 'enzyme hépatique',      value: 16,  unit: 'UI/L',   range: [5, 45],   scaleLabels: ['5', '22', '45'],     warn: false, trendDir: 'down', trendLabel: '↘ −2 vs 2024', history: [18, 17, 17, 16, 16] },
      { id: 'ggt',  name: 'GGT',                   context: 'alcool, médicaments',   value: 10,  unit: 'UI/L',   range: [5, 55],   scaleLabels: ['5', '22', '50'],     warn: false, trendDir: 'down', trendLabel: '↘ −2 vs 2024', history: [12, 11, 11, 10, 10] },
      { id: 'bili', name: 'Bilirubine totale',      context: 'métabolisme hème',      value: 0.6, unit: 'mg/dL',  range: [0.1, 2.0], scaleLabels: ['0,2', '0,8', '1,5'], warn: false, trendDir: 'flat', trendLabel: '→ stable',     history: [0.7, 0.6, 0.6, 0.6, 0.6] },
      { id: 'pal',  name: 'Phosphatases alcalines', context: 'foie et os',           value: 58,  unit: 'UI/L',   range: [30, 150], scaleLabels: ['30', '85', '140'],   warn: false, trendDir: 'flat', trendLabel: '→ stable',     history: [62, 60, 59, 58, 58] },
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
      { id: 'creatinine',   name: 'Créatinine',          context: 'filtration glomérulaire', value: 0.72, unit: 'mg/dL',  range: [0.4, 1.1],  scaleLabels: ['0,4', '0,7', '1,1'],   warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [0.74, 0.73, 0.73, 0.72, 0.72] },
      { id: 'dfg',          name: 'DFG estimé (CKD-EPI)', context: 'fonction rénale', value: 108, unit: 'mL/min', range: [40, 130],  scaleLabels: ['40', '90', '130'],     warn: false, trendDir: 'up',   trendLabel: '↗ +2 vs 2024', history: [106, 107, 108, 108, 108] },
      { id: 'uree',         name: 'Urée',                context: 'déchet azoté',     value: 32,  unit: 'mg/dL',  range: [10, 60],   scaleLabels: ['15', '35', '55'],      warn: false, trendDir: 'down', trendLabel: '↘ −2 vs 2024', history: [34, 33, 33, 32, 32] },
      { id: 'acide_urique', name: 'Acide urique',        context: 'catabolisme purines', value: 4.2, unit: 'mg/dL', range: [2.5, 7.0], scaleLabels: ['2,5', '4,5', '7,0'], warn: false, trendDir: 'down', trendLabel: '↘ −0,3 vs 2024', history: [4.5, 4.4, 4.3, 4.2, 4.2] },
    ],
  },

  // ─── 6. IONOGRAMME ────────────────────────────────────────────────────────
  {
    id: 'ionogramme',
    name: 'Ionogramme sanguin',
    iconColor: 'var(--color-lavender)',
    iconBg: 'var(--color-lavender-soft)',
    status: 'warn',
    statusLabel: '1 à surveiller',
    chartTitle: 'Sodium & chlore — 18 mois',
    chartColor: '#9890B5',
    chartMarkerIds: ['sodium', 'chlore'],
    markers: [
      { id: 'sodium',       name: 'Sodium',       context: 'équilibre hydrique',      value: 139,  unit: 'mEq/L', range: [130, 150], scaleLabels: ['132', '141', '148'],  warn: false, trendDir: 'flat', trendLabel: '→ stable',           history: [138, 139, 139, 139, 139] },
      { id: 'potassium',    name: 'Potassium',    context: 'activité musculaire',     value: 4.0,  unit: 'mEq/L', range: [3.0, 6.0], scaleLabels: ['3,5', '4,5', '5,5'], warn: false, trendDir: 'flat', trendLabel: '→ stable',           history: [4.1, 4.0, 4.0, 4.0, 4.0] },
      { id: 'chlore',       name: 'Chlore',       context: 'équilibre acido-basique', value: 107,  unit: 'mEq/L', range: [98, 110],  scaleLabels: ['98', '103', '110'],   warn: true,  trendDir: 'up',   trendLabel: '↗ +2 vs oct 24',     history: [105, 106, 106, 107, 107] },
      { id: 'bicarbonates', name: 'Bicarbonates', context: 'pH sanguin',              value: 24,   unit: 'mEq/L', range: [18, 32],   scaleLabels: ['18', '25', '32'],     warn: false, trendDir: 'flat', trendLabel: '→ stable',           history: [24, 24, 23, 24, 24] },
    ],
  },

  // ─── 7. BILAN MARTIAL ─────────────────────────────────────────────────────
  {
    id: 'martial',
    name: 'Bilan martial (fer)',
    iconColor: 'var(--color-rust)',
    iconBg: 'var(--color-rust-soft)',
    status: 'warn',
    statusLabel: '2 à surveiller',
    chartTitle: 'Ferritine — 18 mois',
    chartColor: '#B5705A',
    chartMarkerIds: ['ferritine'],
    markers: [
      { id: 'ferritine', name: 'Ferritine',               context: 'réserves de fer · cycle',    value: 40.5, unit: 'µg/L',   range: [10, 150], scaleLabels: ['10', '60', '150'],    warn: true,  trendDir: 'down', trendLabel: '↘ −11,5 vs 2024', history: [52,   48,   44,   42,   40.5] },
      { id: 'fer',       name: 'Fer sérique',             context: 'transport du fer',            value: 15,   unit: 'µmol/L', range: [8, 35],  scaleLabels: ['8', '20', '35'],      warn: false, trendDir: 'flat', trendLabel: '→ stable',        history: [17,   16,   16,   15,   15] },
      { id: 'sat_tf',    name: 'Saturation transferrine', context: 'disponibilité du fer',        value: 41,   unit: '%',      range: [15, 45], scaleLabels: ['15', '30', '45 %'],  warn: true,  trendDir: 'up',   trendLabel: '↗ +6 vs 2024',    history: [35,   36,   38,   40,   41] },
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
      { id: 'calcium',   name: 'Calcium',   context: 'os, contraction musculaire', value: 2.38, unit: 'mmol/L', range: [2.0, 3.0], scaleLabels: ['2,0', '2,5', '3,0'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [2.40, 2.39, 2.38, 2.38, 2.38] },
      { id: 'magnesium', name: 'Magnésium', context: 'énergie, muscle, sommeil',   value: 0.80, unit: 'mmol/L', range: [0.60, 1.10], scaleLabels: ['0,60', '0,85', '1,10'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [0.82, 0.81, 0.80, 0.80, 0.80] },
      { id: 'zinc',      name: 'Zinc',      context: 'immunité, synthèse hormonale', value: 11, unit: 'µmol/L', range: [8, 22], scaleLabels: ['8', '14', '22'],          warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [12, 11, 11, 11, 11] },
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
      { id: 'tsh', name: 'TSH',     context: 'activité thyroïdienne',  value: 1.8, unit: 'mUI/L', range: [0.2, 5.5], scaleLabels: ['0,2', '2,5', '5,5'], warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [1.9, 1.8, 1.8, 1.8, 1.8] },
      { id: 't4l', name: 'T4 libre', context: 'hormone thyroïdienne',  value: 1.1, unit: 'ng/dL', range: [0.7, 2.0], scaleLabels: ['0,7', '1,4', '2,0'],  warn: false, trendDir: 'flat', trendLabel: '→ stable', history: [1.2, 1.1, 1.1, 1.1, 1.1] },
    ],
  },

  // ─── 10. VITAMINES ────────────────────────────────────────────────────────
  {
    id: 'vitamines',
    name: 'Vitamines',
    iconColor: 'var(--color-amber)',
    iconBg: 'var(--color-amber-soft)',
    status: 'warn',
    statusLabel: '2 à corriger',
    chartTitle: 'Vitamine D & folates — 18 mois',
    chartColor: '#D4A574',
    chartMarkerIds: ['vitd', 'folates'],
    markers: [
      { id: 'vitd',    name: 'Vitamine D (25-OH)', context: 'immunité, os, humeur · insuffisance <20', value: 18,  unit: 'ng/mL',  range: [10, 80], scaleLabels: ['10', '40', '80'],      warn: true,  trendDir: 'flat', trendLabel: '→ persistante',     history: [16, 17, 19, 17, 18] },
      { id: 'vitb12',  name: 'Vitamine B12',      context: 'neurologie, globules',                    value: 295, unit: 'pg/mL',  range: [150, 800], scaleLabels: ['150', '450', '800'],  warn: false, trendDir: 'down', trendLabel: '↘ −15 vs 2024',     history: [310, 305, 300, 298, 295] },
      { id: 'folates', name: 'Folates (B9)',       context: 'synthèse ADN · cycle menstruel',          value: 4.7, unit: 'nmol/L', range: [4, 25], scaleLabels: ['4', '12', '24'],         warn: true,  trendDir: 'down', trendLabel: '↘ −1,3 vs 2024',    history: [6.0, 5.5, 5.2, 4.9, 4.7] },
      { id: 'vitb6',   name: 'Vitamine B6',       context: 'neurotransmetteurs',                      value: 16,  unit: 'µg/L',   range: [3, 60], scaleLabels: ['3', '25', '55'],         warn: false, trendDir: 'flat', trendLabel: '→ stable',           history: [18, 17, 17, 16, 16] },
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
      { id: 'crp',         name: 'CRP ultra-sensible', context: 'inflammation systémique', value: 0.3,  unit: 'mg/L',   range: [0, 5],   scaleLabels: ['0', '2,5', '5'],      warn: false, trendDir: 'down', trendLabel: '↘ −0,3 vs 2024', history: [0.6, 0.5, 0.4, 0.4, 0.3] },
      { id: 'fibrinogene', name: 'Fibrinogène',        context: 'coagulation, infection',  value: 2.4,  unit: 'g/L',    range: [1.5, 5], scaleLabels: ['1,5', '3,0', '5,0'],  warn: false, trendDir: 'down', trendLabel: '↘ −0,2 vs 2024', history: [2.6, 2.5, 2.5, 2.4, 2.4] },
      { id: 'homocysteine', name: 'Homocystéine',      context: 'risque cardiovasculaire', value: 8.8,  unit: 'µmol/L', range: [4, 20],  scaleLabels: ['4', '10', '20'],       warn: false, trendDir: 'down', trendLabel: '↘ −1,0 vs 2024', history: [9.8, 9.5, 9.2, 9.0, 8.8] },
    ],
  },
]
