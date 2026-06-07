/**
 * Référentiel local et exhaustif de la biologie médicale française courante.
 *
 * Source UNIQUE et déterministe (zéro appel API) pour : unité canonique,
 * conversion vers l'unité conventionnelle, bornes de référence, catégorie et
 * explication wellness. Le pipeline n'appelle le modèle QUE pour lire le PDF.
 *
 * Conversions : `conversions` mappe une unité source (clé normalisée par
 * unitKey : minuscules, µ→u, sans espace) vers un facteur multiplicatif qui
 * ramène la valeur à l'unité canonique. Ex. cholestérol mmol/L → g/L = ×0.387.
 * Ainsi une valeur rendue en unité SI par un labo est affichée en unité
 * conventionnelle universelle.
 *
 * Style des explications : 1–2 phrases, vocabulaire bien-être, jamais de
 * diagnostic.
 */

export type RefOperator = 'range' | 'lt' | 'gt' | 'none'

export interface SexBounds {
  low: number | null
  high: number | null
}

export interface MarkerReference {
  canonical: string
  aliases: string[]
  unit: string // unité canonique / conventionnelle affichée
  unitAliases?: string[] // variantes brutes d'unité (même échelle) propres au marqueur
  conversions?: Record<string, number> // unité source (unitKey) → facteur vers l'unité canonique
  refLow: number | null
  refHigh: number | null
  refOperator: RefOperator
  bounds?: { M?: SexBounds; F?: SexBounds } // bornes spécifiques par sexe
  category: string
  explanation: string
}

// ─── Table globale d'alias d'unités (raw normalisé → canonique) ─────────────
const UNIT_ALIASES: Record<string, string> = {
  'pcg': 'pg', 'pg': 'pg', 'fl': 'fL',
  '10æ6/mm3': '10^6/mm3', '10^6/mm3': '10^6/mm3', '10*6/mm3': '10^6/mm3', '10*6/ul': '10^6/mm3', 'm/mm3': '10^6/mm3',
  '10^3/mm3': '10^3/mm3', '10*3/mm3': '10^3/mm3', 'milliers/mm3': '10^3/mm3',
  '/mm3': '/mm3', '/mm³': '/mm3',
  'g/l': 'g/L', 'mg/l': 'mg/L', 'ug/l': 'µg/L', 'ng/l': 'ng/L',
  'mg/dl': 'mg/dL', 'g/dl': 'g/dL', 'ug/dl': 'µg/dL',
  'ng/ml': 'ng/mL', 'pg/ml': 'pg/mL', 'ug/ml': 'µg/mL',
  'mmol/l': 'mmol/L', 'umol/l': 'µmol/L', 'nmol/l': 'nmol/L', 'pmol/l': 'pmol/L', 'meq/l': 'mmol/L',
  'ui/l': 'UI/L', 'iu/l': 'UI/L', 'u/l': 'U/L', 'mui/l': 'mUI/L',
  'uui/ml': 'µUI/mL', 'mui/ml': 'mUI/mL', 'ui/ml': 'UI/mL',
  'giga/l': 'Giga/L', 'tera/l': 'Tera/L',
  '%': '%', 'ratio': 'ratio',
  'ml/min': 'mL/min', 'ml/min/1.73m²': 'mL/min', 'ml/min/1,73m²': 'mL/min',
  'mm/h': 'mm/h', 'mg/mmol': 'mg/mmol', 'mg/g': 'mg/g', 'ng/dl': 'ng/dL',
}

export const BLOOD_MARKERS_REFERENCE: MarkerReference[] = [
  // ═══ HÉMATOLOGIE — NFS ═══════════════════════════════════════════════════
  {
    canonical: 'Leucocytes', aliases: ['GB', 'Globules blancs', 'Leucocytes totaux'],
    unit: '/mm3', unitAliases: ['Giga/L', 'G/L'], refLow: 4000, refHigh: 11000, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs — première ligne de défense immunitaire. Un taux dans la norme indique l'absence d'infection ou d'inflammation active.",
  },
  {
    canonical: 'Hématies', aliases: ['GR', 'Globules rouges', 'Érythrocytes', 'Hematies'],
    unit: '10^6/mm3', refLow: 4.2, refHigh: 5.7, refOperator: 'range',
    bounds: { M: { low: 4.5, high: 5.7 }, F: { low: 4.0, high: 5.2 } }, category: 'hematologie',
    explanation: "Globules rouges qui transportent l'oxygène vers les muscles et les organes. Un nombre optimal soutient l'énergie et l'endurance.",
  },
  {
    canonical: 'Hémoglobine', aliases: ['Hb', 'Hgb', 'Hemoglobine'],
    unit: 'g/dL', conversions: { 'g/l': 0.1 }, refLow: 12, refHigh: 18, refOperator: 'range',
    bounds: { M: { low: 13, high: 17 }, F: { low: 12, high: 16 } }, category: 'hematologie',
    explanation: "Transporte l'oxygène dans le sang. Un taux optimal soutient l'énergie ; trop bas, il peut se traduire par de la fatigue.",
  },
  {
    canonical: 'Hématocrite', aliases: ['Ht', 'Hte', 'Hematocrite'],
    unit: '%', refLow: 37, refHigh: 54, refOperator: 'range',
    bounds: { M: { low: 40, high: 54 }, F: { low: 37, high: 47 } }, category: 'hematologie',
    explanation: "Proportion de globules rouges dans le sang. Stable dans la norme, c'est le signe d'un sang équilibré et d'une bonne hydratation.",
  },
  {
    canonical: 'VGM', aliases: ['Volume globulaire moyen', 'MCV', 'V.G.M'],
    unit: 'fL', refLow: 80, refHigh: 100, refOperator: 'range', category: 'hematologie',
    explanation: "Volume moyen des globules rouges. Un VGM normal accompagné d'une hémoglobine stable est un excellent signal d'équilibre.",
  },
  {
    canonical: 'TCMH', aliases: ['Teneur corpusculaire moyenne en hémoglobine', 'TGMH', 'MCH'],
    unit: 'pg', unitAliases: ['pcg'], refLow: 27, refHigh: 34, refOperator: 'range', category: 'hematologie',
    explanation: "Quantité moyenne d'hémoglobine par globule rouge. Dans la norme, elle confirme une bonne qualité du transport de l'oxygène.",
  },
  {
    canonical: 'CCMH', aliases: ['Concentration corpusculaire moyenne en hémoglobine', 'MCHC'],
    unit: 'g/dL', conversions: { 'g/l': 0.1 }, refLow: 32, refHigh: 36, refOperator: 'range', category: 'hematologie',
    explanation: "Concentration d'hémoglobine dans les globules rouges. Une valeur stable dans la norme reflète des globules rouges sains.",
  },
  {
    canonical: 'IDR', aliases: ['RDW', 'Indice de distribution des globules rouges', 'IDR-CV', 'RDW-CV'],
    unit: '%', refLow: 11.5, refHigh: 15.0, refOperator: 'range', category: 'hematologie',
    explanation: "Mesure la variation de taille des globules rouges. Une valeur dans la norme indique une population de globules homogène.",
  },
  {
    canonical: 'Plaquettes', aliases: ['Thrombocytes', 'PLT'],
    unit: '10^3/mm3', unitAliases: ['Giga/L', 'G/L', 'Milliers/mm3'], refLow: 150, refHigh: 400, refOperator: 'range', category: 'hematologie',
    explanation: "Impliquées dans la coagulation. Un taux stable dans la norme protège des saignements sans favoriser la formation de caillots.",
  },
  {
    canonical: 'VMP', aliases: ['MPV', 'Volume moyen plaquettaire', 'V.M.P'],
    unit: 'fL', refLow: 7.0, refHigh: 13.0, refOperator: 'range', category: 'hematologie',
    explanation: "Volume moyen des plaquettes. Une valeur dans la norme accompagne un renouvellement plaquettaire équilibré.",
  },
  {
    canonical: 'Réticulocytes', aliases: ['Reticulocytes'],
    unit: '/mm3', refLow: 25000, refHigh: 100000, refOperator: 'range', category: 'hematologie',
    explanation: "Jeunes globules rouges tout juste produits par la moelle. Un taux dans la norme reflète un renouvellement sanguin sain.",
  },
  {
    canonical: 'Polynucléaires neutrophiles', aliases: ['PNN', 'Neutrophiles', 'Polynucleaires neutrophiles', 'Neutrophiles (absolus)', 'Poly. Neutrophiles'],
    unit: '/mm3', refLow: 1500, refHigh: 7000, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs les plus nombreux, mobilisés face aux bactéries. Un taux équilibré reflète une immunité réactive et au repos.",
  },
  {
    canonical: 'Polynucléaires éosinophiles', aliases: ['Éosinophiles', 'Eosinophiles', 'PNE', 'Poly. Eosinophiles'],
    unit: '/mm3', refLow: 0, refHigh: 500, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs liés aux allergies et à la réponse aux parasites. Un taux bas et stable traduit un terrain peu réactif.",
  },
  {
    canonical: 'Polynucléaires basophiles', aliases: ['Basophiles', 'PNB', 'Poly. Basophiles'],
    unit: '/mm3', refLow: null, refHigh: 100, refOperator: 'lt', category: 'hematologie',
    explanation: "Globules blancs les plus rares, liés aux réactions inflammatoires. Un taux bas dans la norme est parfaitement habituel.",
  },
  {
    canonical: 'Lymphocytes', aliases: ['Lymphocytes (absolus)'],
    unit: '/mm3', refLow: 1000, refHigh: 4000, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs de la mémoire immunitaire. Un taux stable soutient une bonne capacité d'adaptation aux agressions.",
  },
  {
    canonical: 'Monocytes', aliases: ['Monocytes (absolus)'],
    unit: '/mm3', refLow: 200, refHigh: 1000, refOperator: 'range', category: 'hematologie',
    explanation: "Grands globules blancs qui nettoient les débris cellulaires et soutiennent la réparation des tissus.",
  },

  // ═══ HÉMOSTASE ═══════════════════════════════════════════════════════════
  {
    canonical: 'Taux de prothrombine', aliases: ['TP', 'Taux de Quick', 'Temps de Quick du patient'],
    unit: '%', refLow: 70, refHigh: 100, refOperator: 'range', category: 'hemostase',
    explanation: "Évalue la rapidité de coagulation du sang. Un taux dans la norme indique un bon équilibre de la coagulation.",
  },
  {
    canonical: 'INR', aliases: ['International Normalized Ratio'],
    unit: 'ratio', refLow: 0.8, refHigh: 1.2, refOperator: 'range', category: 'hemostase',
    explanation: "Normalise la mesure de coagulation entre laboratoires. Autour de 1, il reflète une coagulation spontanée équilibrée.",
  },
  {
    canonical: 'TCA', aliases: ['Temps de céphaline activée', 'TCK', 'Temps de céphaline + activateur'],
    unit: 'ratio', refLow: 0.8, refHigh: 1.2, refOperator: 'range', category: 'hemostase',
    explanation: "Explore une autre voie de la coagulation. Un rapport patient/témoin dans la norme traduit une coagulation équilibrée.",
  },
  {
    canonical: 'Fibrinogène', aliases: ['Fibrinogene', 'Fibrinémie'],
    unit: 'g/L', refLow: 2.0, refHigh: 4.0, refOperator: 'range', category: 'hemostase',
    explanation: "Protéine clé de la coagulation, aussi marqueur d'inflammation. Une valeur dans la norme reflète un bon équilibre.",
  },
  {
    canonical: 'D-dimères', aliases: ['D dimeres', 'D-dimeres', 'DDimères'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: null, refHigh: 500, refOperator: 'lt', category: 'hemostase',
    explanation: "Produit de dégradation des caillots. Une valeur basse rend très peu probable la présence d'un caillot actif.",
  },

  // ═══ GLUCIDIQUE ══════════════════════════════════════════════════════════
  {
    canonical: 'Glycémie à jeun', aliases: ['Glycémie', 'Glucose', 'Glycemie', 'Glycemie a jeun'],
    unit: 'g/L', conversions: { 'mmol/l': 0.18 }, refLow: 0.70, refHigh: 1.10, refOperator: 'range', category: 'glucides',
    explanation: "Taux de sucre dans le sang à jeun. Stable dans la zone verte, il reflète une bonne sensibilité à l'insuline.",
  },
  {
    canonical: 'Hémoglobine glyquée', aliases: ['HbA1c', 'Hémoglobine glycosylée A1c', 'Hb glyquée', 'Hemoglobine glyquee', 'A1c'],
    unit: '%', refLow: 4.0, refHigh: 6.0, refOperator: 'range', category: 'glucides',
    explanation: "Reflet de la glycémie moyenne sur 3 mois. Une valeur basse confirme une stabilité glucidique durable.",
  },
  {
    canonical: 'Insuline', aliases: ['Insuline à jeun', 'Insulinémie', 'Insulinemie'],
    unit: 'µUI/mL', refLow: 2, refHigh: 25, refOperator: 'range', category: 'glucides',
    explanation: "Hormone de régulation du sucre. Un taux bas à jeun indique une excellente sensibilité à l'insuline.",
  },
  {
    canonical: 'Peptide C', aliases: ['Peptide-C', 'C-peptide'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: 0.9, refHigh: 4.0, refOperator: 'range', category: 'glucides',
    explanation: "Témoin de la production d'insuline par le pancréas. Une valeur dans la norme reflète une sécrétion équilibrée.",
  },
  {
    canonical: 'Fructosamine', aliases: [], unit: 'µmol/L', refLow: 200, refHigh: 285, refOperator: 'range', category: 'glucides',
    explanation: "Reflet de la glycémie sur les 2-3 dernières semaines. Une valeur dans la norme indique une glycémie récente stable.",
  },

  // ═══ RÉNAL ═══════════════════════════════════════════════════════════════
  {
    canonical: 'Créatinine', aliases: ['Créatininémie', 'Creatinine', 'Creatininemie'],
    unit: 'mg/L', unitAliases: [], conversions: { 'umol/l': 0.1131, 'mg/dl': 10 }, refLow: 6, refHigh: 13, refOperator: 'range',
    bounds: { M: { low: 7, high: 13 }, F: { low: 6, high: 11 } }, category: 'reins',
    explanation: "Déchet musculaire filtré par les reins. Stable dans la norme, elle confirme une bonne fonction rénale.",
  },
  {
    canonical: 'DFG (CKD-EPI)', aliases: ['DFG', 'Débit de filtration glomérulaire', 'Estimation du DFG', 'eGFR', 'DFG estimé', 'Debit de filtration glomerulaire', 'Estimation du DFG selon CKD-EPI', 'CKD-EPI'],
    unit: 'mL/min', refLow: 90, refHigh: null, refOperator: 'gt', category: 'reins',
    explanation: "Estime la capacité de filtration des reins. Un DFG élevé est le signe d'une excellente fonction rénale.",
  },
  {
    canonical: 'Clairance de la créatinine', aliases: ['Clairance creatinine', 'Clairance de la creatinine', 'Clairance estimée'],
    unit: 'mL/min', refLow: 90, refHigh: null, refOperator: 'gt', category: 'reins',
    explanation: "Mesure le volume de sang épuré par les reins chaque minute. Une valeur élevée traduit des reins performants.",
  },
  {
    canonical: 'Urée', aliases: ['Urémie', 'Uree', 'Uremie', 'Urea'],
    unit: 'g/L', conversions: { 'mmol/l': 0.06 }, refLow: 0.15, refHigh: 0.45, refOperator: 'range', category: 'reins',
    explanation: "Déchet azoté issu des protéines. Un taux normal indique un équilibre entre apport protéique et élimination rénale.",
  },
  {
    canonical: 'Acide urique', aliases: ['Uricémie', 'Uricemie'],
    unit: 'mg/L', conversions: { 'umol/l': 0.168 }, refLow: 30, refHigh: 70, refOperator: 'range',
    bounds: { M: { low: 35, high: 70 }, F: { low: 25, high: 60 } }, category: 'reins',
    explanation: "Déchet du métabolisme des purines. Un taux dans la norme limite le risque de cristaux articulaires.",
  },
  {
    canonical: 'Cystatine C', aliases: ['Cystatine-C'], unit: 'mg/L', refLow: 0.5, refHigh: 1.0, refOperator: 'range', category: 'reins',
    explanation: "Marqueur fin de la filtration rénale, indépendant de la masse musculaire. Une valeur basse reflète des reins efficaces.",
  },
  {
    canonical: 'Microalbuminurie', aliases: ['Albuminurie', 'Micro-albuminurie', 'Micro albuminurie'],
    unit: 'mg/L', refLow: null, refHigh: 20, refOperator: 'lt', category: 'reins',
    explanation: "Petite quantité d'albumine dans les urines. Une valeur basse est un bon signe de santé rénale et vasculaire.",
  },
  {
    canonical: 'Rapport albumine/créatinine', aliases: ['RAC', 'Ratio albumine creatinine', 'Albumine/Créatinine urinaire', 'Rapport albuminurie/creatininurie'],
    unit: 'mg/mmol', unitAliases: ['mg/g'], refLow: null, refHigh: 3, refOperator: 'lt', category: 'reins',
    explanation: "Rapporte l'albumine urinaire à la créatinine pour fiabiliser la mesure. Une valeur basse est un bon repère rénal.",
  },

  // ═══ LIPIDIQUE ═══════════════════════════════════════════════════════════
  {
    canonical: 'Cholestérol total', aliases: ['Cholestérol', 'CT', 'Cholesterol total', 'Cholesterol'],
    unit: 'g/L', conversions: { 'mmol/l': 0.387 }, refLow: 1.40, refHigh: 2.20, refOperator: 'range', category: 'lipides',
    explanation: "Somme des cholestérols transportés dans le sang. À interpréter avec le HDL et le LDL plutôt que seul.",
  },
  {
    canonical: 'HDL cholestérol', aliases: ['HDL', 'Cholestérol HDL', 'HDL-c', 'HDL cholesterol'],
    unit: 'g/L', conversions: { 'mmol/l': 0.387 }, refLow: 0.40, refHigh: null, refOperator: 'gt',
    bounds: { M: { low: 0.40, high: null }, F: { low: 0.50, high: null } }, category: 'lipides',
    explanation: "Le « bon » cholestérol — évacue les graisses des artères. Un HDL élevé est protecteur, soutenu par l'exercice d'endurance.",
  },
  {
    canonical: 'LDL cholestérol', aliases: ['LDL', 'Cholestérol LDL', 'LDL-c', 'LDL calculé', 'LDL cholesterol', 'LDL calcule', 'LDL CHOLESTEROL calculé'],
    unit: 'g/L', conversions: { 'mmol/l': 0.387 }, refLow: null, refHigh: 1.60, refOperator: 'lt', category: 'lipides',
    explanation: "Le « mauvais » cholestérol — peut s'accumuler dans les artères. Un LDL bas limite la formation de plaques sur le long terme.",
  },
  {
    canonical: 'VLDL', aliases: ['VLDL cholestérol', 'VLDL cholesterol'],
    unit: 'g/L', conversions: { 'mmol/l': 0.387 }, refLow: null, refHigh: null, refOperator: 'none', category: 'lipides',
    explanation: "Lipoprotéine qui transporte surtout les triglycérides. Suivie avec les autres lipides, elle complète la lecture de l'équilibre.",
  },
  {
    canonical: 'Non-HDL cholestérol', aliases: ['Non HDL', 'Cholestérol non HDL', 'Non-HDL', 'Cholesterol non HDL'],
    unit: 'g/L', conversions: { 'mmol/l': 0.387 }, refLow: null, refHigh: 1.30, refOperator: 'lt', category: 'lipides',
    explanation: "Regroupe tous les cholestérols athérogènes (hors HDL). Une valeur basse traduit un profil cardiovasculaire favorable.",
  },
  {
    canonical: 'Triglycérides', aliases: ['TG', 'Triglycerides'],
    unit: 'g/L', conversions: { 'mmol/l': 0.885 }, refLow: null, refHigh: 1.50, refOperator: 'lt', category: 'lipides',
    explanation: "Graisses circulantes issues de l'alimentation et des glucides. Un taux bas reflète un bon métabolisme énergétique.",
  },
  {
    canonical: 'Rapport LDL/HDL', aliases: ['LDL/HDL'], unit: 'ratio', refLow: null, refHigh: 3.5, refOperator: 'lt', category: 'lipides',
    explanation: "Compare le « mauvais » et le « bon » cholestérol. Un rapport bas traduit un profil lipidique favorable au cœur.",
  },
  {
    canonical: 'Rapport Cholestérol total/HDL', aliases: ['CT/HDL', 'Cholestérol total/HDL', 'Rapport CT/HDL', 'Cholesterol total/HDL', 'Rapport CHOLESTEROL TOT./HDL-C.', 'Rapport Cholestérol/HDL', 'Cholestérol/HDL'],
    unit: 'ratio', refLow: null, refHigh: 5.0, refOperator: 'lt', category: 'lipides',
    explanation: "Indicateur clé de l'équilibre lipidique global. Un ratio bas signale un bon partage entre cholestérol protecteur et à surveiller.",
  },
  {
    canonical: 'Apolipoprotéine B', aliases: ['ApoB', 'Apo B', 'Apolipoproteine B'],
    unit: 'g/L', refLow: 0.60, refHigh: 1.30, refOperator: 'range', category: 'lipides',
    explanation: "Reflète le nombre de particules athérogènes. Une valeur basse est associée à un meilleur profil cardiovasculaire.",
  },
  {
    canonical: 'Apolipoprotéine A1', aliases: ['ApoA1', 'Apo A1', 'Apolipoproteine A1', 'Apo A-1'],
    unit: 'g/L', refLow: 1.10, refHigh: 2.10, refOperator: 'range', category: 'lipides',
    explanation: "Principale protéine du « bon » cholestérol HDL. Une valeur élevée accompagne un effet protecteur cardiovasculaire.",
  },
  {
    canonical: 'Lipoprotéine(a)', aliases: ['Lp(a)', 'Lipoproteine a', 'Lipoprotéine a', 'Lp a'],
    unit: 'mg/L', unitAliases: ['nmol/L'], refLow: null, refHigh: 300, refOperator: 'lt', category: 'lipides',
    explanation: "Lipoprotéine en grande partie héréditaire. Une valeur basse est un facteur favorable pour le cœur et les artères.",
  },

  // ═══ IONOGRAMME / MINÉRAUX ═══════════════════════════════════════════════
  {
    canonical: 'Sodium', aliases: ['Natrémie', 'Na', 'Na+', 'Natremie'],
    unit: 'mmol/L', unitAliases: ['mEq/L'], refLow: 135, refHigh: 145, refOperator: 'range', category: 'mineraux',
    explanation: "Électrolyte clé de l'équilibre hydrique et de la pression artérielle. Stable dans la norme, il reflète une bonne hydratation.",
  },
  {
    canonical: 'Potassium', aliases: ['Kaliémie', 'K', 'K+', 'Kaliemie'],
    unit: 'mmol/L', unitAliases: ['mEq/L'], refLow: 3.5, refHigh: 5.1, refOperator: 'range', category: 'mineraux',
    explanation: "Électrolyte essentiel à la contraction musculaire et au rythme cardiaque. Un taux dans la norme soutient cœur et muscles.",
  },
  {
    canonical: 'Chlore', aliases: ['Chlorémie', 'Cl', 'Cl-', 'Chloremie', 'Chlorures'],
    unit: 'mmol/L', unitAliases: ['mEq/L'], refLow: 98, refHigh: 107, refOperator: 'range', category: 'mineraux',
    explanation: "Électrolyte qui accompagne le sodium dans l'équilibre acido-basique et hydrique. Une valeur stable est un bon repère.",
  },
  {
    canonical: 'Bicarbonates', aliases: ['CO2 total', 'Réserve alcaline', 'HCO3', 'Bicarbonate', 'Reserve alcaline'],
    unit: 'mmol/L', unitAliases: ['mEq/L'], refLow: 22, refHigh: 29, refOperator: 'range', category: 'mineraux',
    explanation: "Reflète l'équilibre acido-basique du sang. Une valeur dans la norme accompagne un pH sanguin bien régulé.",
  },
  {
    canonical: 'Calcium', aliases: ['Calcémie', 'Ca', 'Ca2+', 'Calcemie'],
    unit: 'mmol/L', conversions: { 'mg/l': 0.025, 'mg/dl': 0.25 }, refLow: 2.20, refHigh: 2.60, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral clé des os, des muscles et de la coagulation. Une calcémie stable accompagne une bonne santé osseuse et musculaire.",
  },
  {
    canonical: 'Calcium corrigé', aliases: ['Calcium corrige', 'Calcémie corrigée', 'Calcemie corrigee'],
    unit: 'mmol/L', conversions: { 'mg/l': 0.025, 'mg/dl': 0.25 }, refLow: 2.20, refHigh: 2.60, refOperator: 'range', category: 'mineraux',
    explanation: "Calcium ajusté selon l'albumine pour une lecture plus juste. Une valeur dans la norme reflète un bon équilibre calcique.",
  },
  {
    canonical: 'Calcium ionisé', aliases: ['Calcium ionise', 'Ca ionisé', 'Ca++ ionisé', 'Calcium ionise (Ca++)'],
    unit: 'mmol/L', refLow: 1.15, refHigh: 1.35, refOperator: 'range', category: 'mineraux',
    explanation: "Fraction active du calcium, directement disponible pour l'organisme. Une valeur dans la norme est un repère fiable.",
  },
  {
    canonical: 'Phosphore', aliases: ['Phosphorémie', 'Phosphate', 'Phosphates', 'Phosphoremie'],
    unit: 'mmol/L', conversions: { 'mg/l': 0.0323, 'mg/dl': 0.323 }, refLow: 0.80, refHigh: 1.45, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral partenaire du calcium pour les os et l'énergie cellulaire. Une valeur dans la norme reflète un bon équilibre.",
  },
  {
    canonical: 'Magnésium', aliases: ['Magnésémie', 'Mg', 'Mg2+', 'Magnesium', 'Magnesemie'],
    unit: 'mmol/L', conversions: { 'mg/l': 0.0411, 'mg/dl': 0.411 }, refLow: 0.70, refHigh: 1.00, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral du muscle, de l'énergie et du sommeil. Un taux suffisant soutient la récupération et la détente nerveuse.",
  },
  {
    canonical: 'Zinc', aliases: ['Zincémie', 'Zincemie'],
    unit: 'µmol/L', conversions: { 'ug/l': 0.0153, 'ug/dl': 0.153 }, refLow: 11, refHigh: 18, refOperator: 'range', category: 'mineraux',
    explanation: "Oligo-élément clé de l'immunité, de la peau et des hormones. Un statut suffisant soutient la vitalité et la récupération.",
  },
  {
    canonical: 'Cuivre', aliases: ['Cuprémie', 'Cupremie'],
    unit: 'µmol/L', refLow: 11, refHigh: 22, refOperator: 'range', category: 'mineraux',
    explanation: "Oligo-élément impliqué dans le fer, le collagène et les défenses antioxydantes. Une valeur dans la norme reflète un bon équilibre.",
  },
  {
    canonical: 'Sélénium', aliases: ['Selenium', 'Sélénémie'],
    unit: 'µmol/L', refLow: 0.8, refHigh: 2.0, refOperator: 'range', category: 'mineraux',
    explanation: "Oligo-élément antioxydant, partenaire de la thyroïde. Un statut suffisant soutient la protection cellulaire.",
  },

  // ═══ HÉPATIQUE / ENZYMES ═════════════════════════════════════════════════
  {
    canonical: 'ASAT', aliases: ['SGOT', 'S.G.O.T', 'TGO', 'ASAT (TGO)', 'Aspartate aminotransférase', 'ASAT TGO'],
    unit: 'UI/L', refLow: null, refHigh: 40, refOperator: 'lt',
    bounds: { M: { low: null, high: 40 }, F: { low: null, high: 35 } }, category: 'foie',
    explanation: "Enzyme du foie et des muscles. Elle peut monter légèrement après une séance intense — un pic isolé n'est pas préoccupant.",
  },
  {
    canonical: 'ALAT', aliases: ['SGPT', 'S.G.P.T', 'TGP', 'ALAT (TGP)', 'Alanine aminotransférase', 'ALAT TGP'],
    unit: 'UI/L', refLow: null, refHigh: 45, refOperator: 'lt',
    bounds: { M: { low: null, high: 50 }, F: { low: null, high: 35 } }, category: 'foie',
    explanation: "Enzyme plus spécifique du foie. Un taux stable et dans la norme indique l'absence de surcharge hépatique active.",
  },
  {
    canonical: 'GGT', aliases: ['Gamma GT', 'Gamma-GT', 'γGT', 'Gamma glutamyl transférase', 'Gamma glutamyl transferase'],
    unit: 'UI/L', refLow: null, refHigh: 55, refOperator: 'lt',
    bounds: { M: { low: null, high: 60 }, F: { low: null, high: 40 } }, category: 'foie',
    explanation: "Enzyme sensible à l'alcool et à certains médicaments. Un taux bas est un bon signe de santé hépatique globale.",
  },
  {
    canonical: 'Phosphatases alcalines', aliases: ['PAL', 'Phosphatase alcaline', 'ALP'],
    unit: 'UI/L', refLow: 30, refHigh: 130, refOperator: 'range', category: 'foie',
    explanation: "Enzyme partagée entre le foie et les os. Une valeur stable dans la norme suggère une bonne santé hépatique et osseuse.",
  },
  {
    canonical: 'Bilirubine totale', aliases: ['Bilirubine', 'BIL T', 'Bilirubine T'],
    unit: 'mg/L', conversions: { 'umol/l': 0.585 }, refLow: null, refHigh: 12, refOperator: 'lt', category: 'foie',
    explanation: "Produit de dégradation des globules rouges, éliminé par le foie. Un taux normal confirme une bonne fonction hépatique.",
  },
  {
    canonical: 'Bilirubine conjuguée', aliases: ['Bilirubine directe', 'BIL D', 'Bilirubine conjuguee'],
    unit: 'mg/L', conversions: { 'umol/l': 0.585 }, refLow: null, refHigh: 3, refOperator: 'lt', category: 'foie',
    explanation: "Fraction de la bilirubine déjà traitée par le foie. Une valeur basse accompagne une bonne élimination hépatique.",
  },
  {
    canonical: 'Bilirubine libre', aliases: ['Bilirubine indirecte', 'Bilirubine non conjuguée', 'Bilirubine non conjuguee'],
    unit: 'mg/L', conversions: { 'umol/l': 0.585 }, refLow: null, refHigh: 10, refOperator: 'lt', category: 'foie',
    explanation: "Fraction de la bilirubine avant traitement par le foie. Une valeur dans la norme reflète un renouvellement sanguin physiologique.",
  },
  {
    canonical: 'LDH', aliases: ['Lactate déshydrogénase', 'LDH (LD)', 'LD', 'Lactate deshydrogenase'],
    unit: 'U/L', refLow: 135, refHigh: 225, refOperator: 'range', category: 'foie',
    explanation: "Enzyme présente dans de nombreux tissus, marqueur général d'activité cellulaire. Une valeur dans la norme accompagne un fonctionnement équilibré.",
  },
  {
    canonical: 'CPK', aliases: ['CK', 'Créatine phosphokinase', 'Créatine kinase', 'CPK totale', 'Creatine kinase', 'Creatine phosphokinase'],
    unit: 'UI/L', refLow: null, refHigh: 200, refOperator: 'lt',
    bounds: { M: { low: null, high: 200 }, F: { low: null, high: 170 } }, category: 'foie',
    explanation: "Enzyme musculaire qui s'élève après un effort intense. Un pic transitoire après le sport est attendu et sans gravité.",
  },

  // ═══ PANCRÉAS ════════════════════════════════════════════════════════════
  {
    canonical: 'Lipase', aliases: ['Lipasémie', 'Lipasemie'], unit: 'UI/L', refLow: null, refHigh: 60, refOperator: 'lt', category: 'pancreas',
    explanation: "Enzyme digestive produite par le pancréas. Une valeur dans la norme reflète un pancréas au repos et fonctionnel.",
  },
  {
    canonical: 'Amylase', aliases: ['Amylasémie', 'Amylasemie'], unit: 'UI/L', refLow: 28, refHigh: 100, refOperator: 'range', category: 'pancreas',
    explanation: "Enzyme digestive du pancréas et des glandes salivaires. Une valeur dans la norme accompagne une bonne digestion.",
  },

  // ═══ PROTÉINES ═══════════════════════════════════════════════════════════
  {
    canonical: 'Protéines totales', aliases: ['Protidémie', 'Protéines sériques', 'Proteines totales', 'Protidemie'],
    unit: 'g/L', conversions: { 'g/dl': 10 }, refLow: 65, refHigh: 80, refOperator: 'range', category: 'foie',
    explanation: "Ensemble des protéines du sang (albumine + globulines). Une valeur dans la norme reflète un bon état nutritionnel et hépatique.",
  },
  {
    canonical: 'Albumine', aliases: ['Albuminémie', 'Albuminemie'],
    unit: 'g/L', conversions: { 'g/dl': 10 }, refLow: 38, refHigh: 50, refOperator: 'range', category: 'foie',
    explanation: "Principale protéine du sang, fabriquée par le foie. Un taux dans la norme accompagne un bon état nutritionnel et hépatique.",
  },
  {
    canonical: 'Préalbumine', aliases: ['Transthyrétine', 'Transthyretine', 'Prealbumine'],
    unit: 'g/L', refLow: 0.20, refHigh: 0.40, refOperator: 'range', category: 'foie',
    explanation: "Protéine au renouvellement rapide, témoin fin de l'état nutritionnel récent. Une valeur dans la norme est rassurante.",
  },
  {
    canonical: 'Ferritine', aliases: ['Ferritinémie', 'Ferritinemie'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: 30, refHigh: 300, refOperator: 'range',
    bounds: { M: { low: 30, high: 400 }, F: { low: 15, high: 200 } }, category: 'mineraux',
    explanation: "Reflète les réserves de fer de l'organisme. Un taux suffisant soutient l'énergie, l'endurance et l'oxygénation des tissus.",
  },
  {
    canonical: 'Transferrine', aliases: ['Sidérophiline', 'Siderophiline'], unit: 'g/L', refLow: 2.0, refHigh: 4.0, refOperator: 'range', category: 'mineraux',
    explanation: "Protéine de transport du fer dans le sang. Une valeur dans la norme accompagne une bonne gestion du fer.",
  },
  {
    canonical: 'Coefficient de saturation de la transferrine', aliases: ['CST', 'Saturation de la transferrine', 'Coefficient de saturation', 'CS transferrine', 'Saturation transferrine'],
    unit: '%', refLow: 20, refHigh: 40, refOperator: 'range', category: 'mineraux',
    explanation: "Part de la transferrine occupée par du fer. Dans la norme, elle indique une bonne disponibilité du fer.",
  },
  {
    canonical: 'Fer sérique', aliases: ['Fer', 'Sidérémie', 'Fer serique', 'Sideremie'],
    unit: 'µmol/L', conversions: { 'ug/dl': 0.179, 'ug/l': 0.0179 }, refLow: 11, refHigh: 31, refOperator: 'range',
    bounds: { M: { low: 11, high: 28 }, F: { low: 9, high: 30 } }, category: 'mineraux',
    explanation: "Fer circulant dans le sang. À lire avec la ferritine et la saturation, il complète le bilan du fer.",
  },
  {
    canonical: 'Haptoglobine', aliases: [], unit: 'g/L', refLow: 0.30, refHigh: 2.00, refOperator: 'range', category: 'inflammation',
    explanation: "Protéine qui récupère l'hémoglobine libérée, aussi marqueur d'inflammation. Une valeur dans la norme est un bon repère.",
  },
  {
    canonical: 'Bêta-2 microglobuline', aliases: ['Beta-2 microglobuline', 'B2 microglobuline', 'Béta 2 microglobuline', 'B2M'],
    unit: 'mg/L', refLow: 0.80, refHigh: 2.40, refOperator: 'range', category: 'reins',
    explanation: "Petite protéine filtrée par les reins, marqueur de renouvellement cellulaire. Une valeur dans la norme est rassurante.",
  },
  {
    canonical: 'CRP', aliases: ['Protéine C réactive', 'CRP standard', 'Proteine C reactive', 'C-réactive protéine'],
    unit: 'mg/L', refLow: null, refHigh: 5, refOperator: 'lt', category: 'inflammation',
    explanation: "Marqueur d'inflammation. Une valeur basse indique l'absence d'inflammation active dans l'organisme.",
  },
  {
    canonical: 'CRP ultrasensible', aliases: ['CRP us', 'CRP-hs', 'hs-CRP', 'CRP ultra-sensible', 'CRP ultrasensible', 'CRPus'],
    unit: 'mg/L', refLow: null, refHigh: 1.0, refOperator: 'lt', category: 'inflammation',
    explanation: "Mesure très fine de l'inflammation de bas grade. Une valeur basse est un signal favorable pour la santé cardiovasculaire.",
  },
  {
    canonical: 'Procalcitonine', aliases: ['PCT'], unit: 'µg/L', refLow: null, refHigh: 0.5, refOperator: 'lt', category: 'inflammation',
    explanation: "Marqueur qui s'élève surtout lors d'infections bactériennes. Une valeur basse rend une infection bactérienne peu probable.",
  },
  {
    canonical: 'Vitesse de sédimentation', aliases: ['VS', 'Vitesse de sedimentation'],
    unit: 'mm/h', refLow: null, refHigh: 20, refOperator: 'lt', category: 'inflammation',
    explanation: "Marqueur indirect et lent de l'inflammation. Une valeur basse accompagne l'absence d'inflammation chronique.",
  },

  // ═══ THYROÏDE ════════════════════════════════════════════════════════════
  {
    canonical: 'TSH', aliases: ['TSH us', 'Thyréostimuline', 'TSH ultrasensible', 'Thyreostimuline', 'TSHus'],
    unit: 'mUI/L', refLow: 0.27, refHigh: 4.20, refOperator: 'range', category: 'thyroide',
    explanation: "Hormone qui régule la thyroïde, chef d'orchestre du métabolisme. Stable dans la norme, elle accompagne une bonne régulation de l'énergie.",
  },
  {
    canonical: 'T4 libre', aliases: ['T4L', 'FT4', 'Thyroxine libre', 'T4 L'],
    unit: 'pmol/L', unitAliases: ['ng/dL'], refLow: 12, refHigh: 22, refOperator: 'range', category: 'thyroide',
    explanation: "Hormone thyroïdienne libre, forme active disponible. Une valeur dans la norme reflète une thyroïde bien équilibrée.",
  },
  {
    canonical: 'T3 libre', aliases: ['T3L', 'FT3', 'Tri-iodothyronine libre', 'T3 L', 'Tri iodothyronine libre'],
    unit: 'pmol/L', unitAliases: ['ng/L'], refLow: 3.1, refHigh: 6.8, refOperator: 'range', category: 'thyroide',
    explanation: "Hormone thyroïdienne la plus active. Une valeur dans la norme accompagne un bon tonus métabolique.",
  },
  {
    canonical: 'T4 totale', aliases: ['T4', 'Thyroxine totale'], unit: 'nmol/L', refLow: 66, refHigh: 181, refOperator: 'range', category: 'thyroide',
    explanation: "Quantité totale d'hormone T4, liée et libre. Lue avec la T4 libre, elle complète l'évaluation thyroïdienne.",
  },
  {
    canonical: 'T3 totale', aliases: ['T3', 'Tri-iodothyronine totale'], unit: 'nmol/L', refLow: 1.3, refHigh: 3.1, refOperator: 'range', category: 'thyroide',
    explanation: "Quantité totale d'hormone T3. Une valeur dans la norme accompagne un métabolisme équilibré.",
  },
  {
    canonical: 'Anticorps anti-TPO', aliases: ['Anti-TPO', 'Ac anti-thyropéroxydase', 'Anticorps anti-thyroperoxydase', 'Anti TPO', 'AcTPO'],
    unit: 'UI/mL', refLow: null, refHigh: 34, refOperator: 'lt', category: 'thyroide',
    explanation: "Anticorps dirigés contre une enzyme thyroïdienne. Une valeur basse indique l'absence d'auto-immunité thyroïdienne active.",
  },
  {
    canonical: 'Anticorps anti-thyroglobuline', aliases: ['Anti-TG', 'Ac anti-thyroglobuline', 'Anticorps anti-Tg', 'Anti TG', 'AcTG'],
    unit: 'UI/mL', refLow: null, refHigh: 115, refOperator: 'lt', category: 'thyroide',
    explanation: "Anticorps dirigés contre une protéine thyroïdienne. Une valeur basse est un signe favorable pour la thyroïde.",
  },
  {
    canonical: 'Thyroglobuline', aliases: ['Tg'], unit: 'µg/L', refLow: null, refHigh: 55, refOperator: 'lt', category: 'thyroide',
    explanation: "Protéine produite par la thyroïde. Une valeur dans la norme accompagne un fonctionnement thyroïdien habituel.",
  },

  // ═══ VITAMINES ═══════════════════════════════════════════════════════════
  {
    canonical: '25-OH Vitamine D', aliases: ['Vitamine D', '25-(OH)-Vitamine D (D2+D3)', '25 OH vitamine D', 'Vit D', 'Vitamine D3', '25 OH Vitamine D', '25-OH-vitamine D'],
    unit: 'ng/mL', conversions: { 'nmol/l': 0.4 }, refLow: 30, refHigh: 60, refOperator: 'range', category: 'vitamines',
    explanation: "Soutient les os, les muscles et l'immunité. Un statut suffisant, surtout en hiver, contribue au tonus et à la solidité osseuse.",
  },
  {
    canonical: 'Vitamine B12', aliases: ['B12', 'Cobalamine', 'Vit B12', 'Vitamine B 12'],
    unit: 'pg/mL', conversions: { 'pmol/l': 1.355 }, refLow: 200, refHigh: 900, refOperator: 'range', category: 'vitamines',
    explanation: "Essentielle aux nerfs et à la formation des globules rouges. Un statut suffisant soutient l'énergie et la concentration.",
  },
  {
    canonical: 'Folates', aliases: ['B9', 'Folates sériques', 'Acide folique', 'Vitamine B9', 'Folate', 'Folates seriques'],
    unit: 'µg/L', unitAliases: ['ng/mL'], conversions: { 'nmol/l': 0.441 }, refLow: 3.1, refHigh: 20, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine clé du renouvellement cellulaire et de la formation du sang. Un statut suffisant soutient la vitalité.",
  },
  {
    canonical: 'Homocystéine', aliases: ['Homocysteine', 'HCY'], unit: 'µmol/L', refLow: null, refHigh: 15, refOperator: 'lt', category: 'vitamines',
    explanation: "Acide aminé lié au statut en vitamines B. Une valeur basse est associée à un meilleur profil cardiovasculaire.",
  },
  {
    canonical: 'Vitamine B6', aliases: ['Pyridoxine', 'B6', 'Vit B6'], unit: 'µg/L', refLow: 5, refHigh: 50, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine du système nerveux et du métabolisme des protéines. Un statut suffisant soutient l'humeur et l'énergie.",
  },
  {
    canonical: 'Vitamine B1', aliases: ['Thiamine', 'B1', 'Vit B1'], unit: 'µg/L', refLow: 20, refHigh: 100, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine clé de la production d'énergie à partir des glucides. Un statut suffisant soutient le tonus.",
  },
  {
    canonical: 'Vitamine A', aliases: ['Rétinol', 'Retinol'], unit: 'µmol/L', refLow: 1.05, refHigh: 2.45, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine de la vision, de la peau et de l'immunité. Un statut dans la norme accompagne une bonne santé cellulaire.",
  },
  {
    canonical: 'Vitamine E', aliases: ['Tocophérol', 'Alpha-tocophérol', 'Tocopherol'], unit: 'mg/L', refLow: 5, refHigh: 18, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine antioxydante qui protège les cellules. Un statut suffisant soutient la protection contre le stress oxydatif.",
  },
  {
    canonical: 'Vitamine C', aliases: ['Acide ascorbique'], unit: 'mg/L', refLow: 4, refHigh: 20, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine antioxydante de l'immunité et du collagène. Un statut suffisant soutient les défenses et la récupération.",
  },

  // ═══ HORMONES ════════════════════════════════════════════════════════════
  {
    canonical: 'Testostérone', aliases: ['Testostérone totale', 'Testostéronémie', 'Testosterone', 'Testosterone totale'],
    unit: 'µg/L', unitAliases: ['ng/mL'], conversions: { 'nmol/l': 0.288 }, refLow: 2.5, refHigh: 9.0, refOperator: 'range',
    bounds: { M: { low: 2.5, high: 9.0 }, F: { low: 0.1, high: 0.8 } }, category: 'hormones',
    explanation: "Hormone clé de la masse musculaire, de la libido et de l'énergie. Une valeur dans la norme accompagne un bon équilibre hormonal.",
  },
  {
    canonical: 'Testostérone libre', aliases: ['Testosterone libre', 'Testostérone biodisponible'],
    unit: 'pg/mL', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Fraction de la testostérone directement disponible. Les valeurs de référence dépendent du sexe et de l'âge.",
  },
  {
    canonical: 'SHBG', aliases: ['Sex hormone binding globulin', 'Protéine de transport des hormones sexuelles'],
    unit: 'nmol/L', refLow: 18, refHigh: 54, refOperator: 'range', category: 'hormones',
    explanation: "Protéine qui transporte les hormones sexuelles. Lue avec la testostérone, elle affine la lecture hormonale.",
  },
  {
    canonical: 'Œstradiol', aliases: ['Estradiol', 'E2', 'Oestradiol'],
    unit: 'ng/L', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Principale hormone œstrogénique. Les valeurs de référence varient selon le sexe et la phase du cycle.",
  },
  {
    canonical: 'Progestérone', aliases: ['Progesterone'],
    unit: 'µg/L', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Hormone du cycle féminin et de la grossesse. Les valeurs de référence dépendent du moment du cycle.",
  },
  {
    canonical: 'FSH', aliases: ['Hormone folliculo-stimulante', 'Hormone folliculostimulante'],
    unit: 'UI/L', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Hormone qui pilote la fonction des ovaires et des testicules. Les valeurs de référence dépendent du sexe et du cycle.",
  },
  {
    canonical: 'LH', aliases: ['Hormone lutéinisante', 'Hormone luteinisante'],
    unit: 'UI/L', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Hormone qui déclenche l'ovulation et soutient la production hormonale. Les références dépendent du sexe et du cycle.",
  },
  {
    canonical: 'Prolactine', aliases: ['PRL'],
    unit: 'µg/L', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Hormone de la lactation, présente chez tous. Les valeurs de référence dépendent du sexe et du contexte.",
  },
  {
    canonical: 'DHEA-S', aliases: ['DHEA sulfate', 'Sulfate de DHEA', 'SDHEA', 'Déhydroépiandrostérone sulfate'],
    unit: 'µg/dL', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Hormone surrénalienne précurseur des hormones sexuelles. Les références diminuent avec l'âge.",
  },
  {
    canonical: 'Cortisol', aliases: ['Cortisol 8h', 'Cortisolémie', 'Cortisol (8h)', 'Cortisolemie'],
    unit: 'µg/dL', unitAliases: ['nmol/L'], conversions: { 'nmol/l': 0.0363 }, refLow: 6, refHigh: 19, refOperator: 'range', category: 'hormones',
    explanation: "Hormone du stress et du réveil, plus élevée le matin. Une valeur matinale dans la norme reflète un bon rythme.",
  },
  {
    canonical: 'Parathormone', aliases: ['PTH', 'Parathormone (PTH)', 'Hormone parathyroïdienne', 'Hormone parathyroidienne'],
    unit: 'pg/mL', refLow: 15, refHigh: 65, refOperator: 'range', category: 'hormones',
    explanation: "Hormone qui régule le calcium et les os. Lue avec la calcémie et la vitamine D, elle complète le bilan osseux.",
  },
  {
    canonical: 'IGF-1', aliases: ['IGF1', 'Somatomédine C', 'Facteur de croissance IGF-1', 'Somatomedine C'],
    unit: 'ng/mL', refLow: null, refHigh: null, refOperator: 'none', category: 'hormones',
    explanation: "Reflet de l'hormone de croissance, impliqué dans la réparation des tissus. Les références dépendent fortement de l'âge.",
  },
  {
    canonical: 'PSA', aliases: ['Antigène prostatique spécifique', 'PSA total', 'Antigene prostatique specifique'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: null, refHigh: 4.0, refOperator: 'lt', category: 'hormones',
    explanation: "Protéine produite par la prostate, suivie surtout chez l'homme. Une valeur basse est un repère de routine rassurant.",
  },

  // ═══ CARDIAQUE ═══════════════════════════════════════════════════════════
  {
    canonical: 'NT-proBNP', aliases: ['proBNP', 'NT pro BNP', 'BNP', 'NT-pro-BNP'],
    unit: 'ng/L', refLow: null, refHigh: 125, refOperator: 'lt', category: 'cardiaque',
    explanation: "Marqueur de la tension exercée sur le cœur. Une valeur basse est rassurante sur la fonction cardiaque.",
  },
  {
    canonical: 'Troponine', aliases: ['Troponine T', 'Troponine I', 'Troponine hs', 'Troponine ultrasensible', 'Troponine T hs'],
    unit: 'ng/L', refLow: null, refHigh: 14, refOperator: 'lt', category: 'cardiaque',
    explanation: "Marqueur très spécifique du muscle cardiaque. Une valeur basse traduit l'absence de souffrance du cœur.",
  },
]

// ─── Normalisation ───────────────────────────────────────────────────────────

/** minuscules, sans accents, sans ponctuation, espaces compactés. */
export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Clé d'unité normalisée : minuscules, µ→u, sans espace. */
export function unitKey(u: string | null | undefined): string {
  return (u || '').toLowerCase().replace(/[µμ]/g, 'u').replace(/\s+/g, '').trim()
}

/** Gère virgule décimale FR, séparateurs de milliers (espaces/points), signes. */
export function normalizeNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  let s = String(input).trim()
  if (!s) return null
  s = s.replace(/[\s   ]/g, '') // espaces (milliers), y compris insécables/fins
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    s = s.replace(/\./g, '').replace(',', '.') // '.' milliers, ',' décimale
  } else if (hasComma) {
    s = s.replace(',', '.')
  }
  s = s.replace(/[^0-9.\-]/g, '')
  if (!s || s === '-' || s === '.') return null
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : null
}

/** Normalise une unité brute via la table d'alias (le référentiel fait autorité). */
export function normalizeUnit(rawUnit: string | null | undefined, canonicalUnit?: string): string {
  if (!rawUnit || !rawUnit.trim()) return canonicalUnit ?? ''
  const key = rawUnit.trim().replace(/\s+/g, '').toLowerCase()
  if (UNIT_ALIASES[key]) return UNIT_ALIASES[key]
  if (canonicalUnit && key === canonicalUnit.replace(/\s+/g, '').toLowerCase()) return canonicalUnit
  return canonicalUnit ?? rawUnit.trim()
}

/** Arrondi lisible selon l'ordre de grandeur (après conversion). */
function roundSmart(v: number): number {
  const a = Math.abs(v)
  if (a >= 100) return Math.round(v)
  if (a >= 10) return Math.round(v * 10) / 10
  if (a >= 1) return Math.round(v * 100) / 100
  return Math.round(v * 1000) / 1000
}

/**
 * Convertit une valeur exprimée dans l'unité brute du labo vers l'unité
 * canonique/conventionnelle du référentiel, de façon déterministe.
 * - même unité que la canonique → inchangé
 * - facteur de conversion connu → valeur convertie + unité canonique
 * - alias de même échelle → relabellisé en canonique
 * - unité inconnue → valeur conservée, unité brute nettoyée (pas de mislabel)
 */
export function convertToCanonical(
  value: number | null,
  rawUnit: string | null | undefined,
  ref: MarkerReference,
): { value: number | null; unit: string; converted: boolean } {
  const canon = ref.unit
  if (value === null || value === undefined) return { value, unit: canon, converted: false }
  if (!rawUnit || !rawUnit.trim()) return { value, unit: canon, converted: false }

  const k = unitKey(rawUnit)
  if (k === unitKey(canon)) return { value, unit: canon, converted: false }

  const factor = ref.conversions?.[k]
  if (factor !== undefined) return { value: roundSmart(value * factor), unit: canon, converted: true }

  // alias déclaré de même échelle → simple relabel
  if (ref.unitAliases?.some(a => unitKey(a) === k)) return { value, unit: canon, converted: false }

  // unité inconnue : on garde la valeur et l'unité nettoyée (pas de conversion hasardeuse)
  return { value, unit: normalizeUnit(rawUnit), converted: false }
}

// ─── Lookup déterministe ─────────────────────────────────────────────────────

const REFERENCE_INDEX: Map<string, MarkerReference> = (() => {
  const map = new Map<string, MarkerReference>()
  for (const entry of BLOOD_MARKERS_REFERENCE) {
    map.set(normalizeName(entry.canonical), entry)
    for (const alias of entry.aliases) {
      const key = normalizeName(alias)
      if (key && !map.has(key)) map.set(key, entry)
    }
  }
  return map
})()

// Développe les abréviations courantes (normalizeName a déjà retiré les points
// d'abréviation : "Poly." → "poly"). Tolérant aux variantes des bilans FR.
function expandAbbrev(s: string): string {
  return s
    .replace(/\bpoly\b/g, 'polynucleaires')
    .replace(/\bpolynucleaire\b/g, 'polynucleaires')
}

/**
 * Retrouve une entrée par nom canonique OU alias, normalisé. Tolère :
 * les accents/casse/espaces/ponctuation (normalizeName), les qualificatifs
 * entre parenthèses (ex. "ASAT (TGO)" → "ASAT"), et les abréviations
 * (ex. "Poly. Neutrophiles" → "polynucleaires neutrophiles").
 */
export function matchMarker(rawName: string | null | undefined): MarkerReference | undefined {
  if (!rawName) return undefined
  const base = normalizeName(rawName)
  const noParen = normalizeName(String(rawName).replace(/\([^)]*\)/g, ' '))
  const candidates = [base, expandAbbrev(base), noParen, expandAbbrev(noParen)]
  for (const c of candidates) {
    if (!c) continue
    const e = REFERENCE_INDEX.get(c)
    if (e) return e
  }
  return undefined
}

/** Bornes effectives d'un marqueur en tenant compte du sexe si disponible. */
export function boundsForSex(ref: MarkerReference, sex?: 'M' | 'F' | null): { low: number | null; high: number | null } {
  if (sex && ref.bounds?.[sex]) {
    return { low: ref.bounds[sex]!.low, high: ref.bounds[sex]!.high }
  }
  return { low: ref.refLow, high: ref.refHigh }
}

// ─── Complétion d'un marqueur extrait ────────────────────────────────────────

export interface CompletableMarker {
  markerCode?: string
  markerName: string
  value: number
  unit?: string | null
  refMin?: number | null
  refMax?: number | null
  organSystem?: string | null
  explanation?: string | null
  needsReview?: boolean
}

const isBlank = (s: string | null | undefined) => !s || !s.trim()

/**
 * Complète un marqueur extrait depuis le référentiel local (sans appel API) :
 * unité, bornes, catégorie et explication manquantes. Marqueur absent →
 * `needsReview`.
 */
export function completeMarkerFromReference<T extends CompletableMarker>(m: T, sex?: 'M' | 'F' | null): T {
  const ref = matchMarker(m.markerName) ?? matchMarker(m.markerCode)
  if (!ref) {
    return { ...m, needsReview: true }
  }
  const b = boundsForSex(ref, sex)
  return {
    ...m,
    unit: isBlank(m.unit) ? ref.unit : m.unit,
    refMin: m.refMin === null || m.refMin === undefined ? b.low : m.refMin,
    refMax: m.refMax === null || m.refMax === undefined ? b.high : m.refMax,
    organSystem: ref.category,
    explanation: ref.explanation,
    needsReview: false,
  }
}
