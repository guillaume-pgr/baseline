/**
 * Référentiel local et exhaustif de la biologie médicale française courante.
 *
 * Source UNIQUE et déterministe (zéro appel API) pour : unité canonique,
 * bornes de référence, catégorie et explication wellness. Le pipeline
 * d'extraction n'appelle le modèle QUE pour lire le PDF ; tout le reste
 * (normalisation, réconciliation, complétion) s'appuie sur ce fichier.
 *
 * `category` reprend les clés de groupe de realDataAdapter pour des couleurs
 * cohérentes (hematologie, lipides, glucides, foie, reins, thyroide,
 * vitamines, mineraux, inflammation) ; quelques familles supplémentaires
 * (hemostase, hormones) prennent la couleur par défaut.
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
  unit: string // unité canonique affichée
  unitAliases?: string[] // variantes brutes d'unité propres à ce marqueur
  refLow: number | null
  refHigh: number | null
  refOperator: RefOperator
  bounds?: { M?: SexBounds; F?: SexBounds } // bornes spécifiques par sexe
  category: string
  explanation: string
}

// ─── Table globale d'alias d'unités (raw normalisé → canonique) ─────────────
// Les clés sont normalisées (minuscules, sans espaces).
const UNIT_ALIASES: Record<string, string> = {
  'pcg': 'pg',
  'pg': 'pg',
  'fl': 'fL',
  '10æ6/mm3': '10^6/mm3',
  '10^6/mm3': '10^6/mm3',
  '10*6/mm3': '10^6/mm3',
  '10*6/ul': '10^6/mm3',
  'm/mm3': '10^6/mm3',
  '10^3/mm3': '10^3/mm3',
  '10*3/mm3': '10^3/mm3',
  'milliers/mm3': '10^3/mm3',
  '/mm3': '/mm3',
  '/mm³': '/mm3',
  'g/l': 'g/L',
  'mg/l': 'mg/L',
  'µg/l': 'µg/L',
  'ug/l': 'µg/L',
  'ng/l': 'ng/L',
  'mg/dl': 'mg/dL',
  'g/dl': 'g/dL',
  'µg/dl': 'µg/dL',
  'ug/dl': 'µg/dL',
  'ng/ml': 'ng/mL',
  'pg/ml': 'pg/mL',
  'µg/ml': 'µg/mL',
  'ug/ml': 'µg/mL',
  'mmol/l': 'mmol/L',
  'µmol/l': 'µmol/L',
  'umol/l': 'µmol/L',
  'nmol/l': 'nmol/L',
  'pmol/l': 'pmol/L',
  'meq/l': 'mmol/L',
  'ui/l': 'UI/L',
  'iu/l': 'UI/L',
  'u/l': 'U/L',
  'mui/l': 'mUI/L',
  'µui/ml': 'µUI/mL',
  'uui/ml': 'µUI/mL',
  'mui/ml': 'mUI/mL',
  'ui/ml': 'UI/mL',
  'giga/l': 'Giga/L',
  'g/l(giga)': 'Giga/L',
  'tera/l': 'Tera/L',
  '%': '%',
  'ratio': 'ratio',
  'ml/min': 'mL/min',
  'ml/min/1.73m²': 'mL/min',
  'ml/min/1,73m²': 'mL/min',
  'mm/h': 'mm/h',
  'mui/ll': 'mUI/L',
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
    unit: 'g/dL', refLow: 12, refHigh: 18, refOperator: 'range',
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
    unit: 'g/dL', refLow: 32, refHigh: 36, refOperator: 'range', category: 'hematologie',
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
  // Formule leucocytaire (valeurs absolues)
  {
    canonical: 'Polynucléaires neutrophiles', aliases: ['PNN', 'Neutrophiles', 'Polynucleaires neutrophiles', 'Neutrophiles (absolus)'],
    unit: '/mm3', refLow: 1500, refHigh: 7000, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs les plus nombreux, mobilisés face aux bactéries. Un taux équilibré reflète une immunité réactive et au repos.",
  },
  {
    canonical: 'Polynucléaires éosinophiles', aliases: ['Éosinophiles', 'Eosinophiles', 'PNE'],
    unit: '/mm3', refLow: 0, refHigh: 500, refOperator: 'range', category: 'hematologie',
    explanation: "Globules blancs liés aux allergies et à la réponse aux parasites. Un taux bas et stable traduit un terrain peu réactif.",
  },
  {
    canonical: 'Polynucléaires basophiles', aliases: ['Basophiles', 'PNB'],
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
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: 0.70, refHigh: 1.10, refOperator: 'range', category: 'glucides',
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

  // ═══ RÉNAL ═══════════════════════════════════════════════════════════════
  {
    canonical: 'Créatinine', aliases: ['Créatininémie', 'Creatinine', 'Creatininemie'],
    unit: 'mg/L', unitAliases: ['µmol/L'], refLow: 6, refHigh: 13, refOperator: 'range',
    bounds: { M: { low: 7, high: 13 }, F: { low: 6, high: 11 } }, category: 'reins',
    explanation: "Déchet musculaire filtré par les reins. Stable dans la norme, elle confirme une bonne fonction rénale.",
  },
  {
    canonical: 'DFG (CKD-EPI)', aliases: ['DFG', 'Débit de filtration glomérulaire', 'Estimation du DFG', 'eGFR', 'Clairance estimée', 'DFG estimé', 'Debit de filtration glomerulaire'],
    unit: 'mL/min', refLow: 90, refHigh: null, refOperator: 'gt', category: 'reins',
    explanation: "Estime la capacité de filtration des reins. Un DFG élevé est le signe d'une excellente fonction rénale.",
  },
  {
    canonical: 'Urée', aliases: ['Urémie', 'Uree', 'Uremie', 'Urea'],
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: 0.15, refHigh: 0.45, refOperator: 'range', category: 'reins',
    explanation: "Déchet azoté issu des protéines. Un taux normal indique un équilibre entre apport protéique et élimination rénale.",
  },
  {
    canonical: 'Acide urique', aliases: ['Uricémie', 'Uricemie'],
    unit: 'mg/L', unitAliases: ['µmol/L'], refLow: 30, refHigh: 70, refOperator: 'range',
    bounds: { M: { low: 35, high: 70 }, F: { low: 25, high: 60 } }, category: 'reins',
    explanation: "Déchet du métabolisme des purines. Un taux dans la norme limite le risque de cristaux articulaires.",
  },
  {
    canonical: 'Cystatine C', aliases: ['Cystatine-C'],
    unit: 'mg/L', refLow: 0.5, refHigh: 1.0, refOperator: 'range', category: 'reins',
    explanation: "Marqueur fin de la filtration rénale, indépendant de la masse musculaire. Une valeur basse reflète des reins efficaces.",
  },
  {
    canonical: 'Microalbuminurie', aliases: ['Albuminurie', 'Micro-albuminurie', 'Micro albuminurie'],
    unit: 'mg/L', refLow: null, refHigh: 20, refOperator: 'lt', category: 'reins',
    explanation: "Petite quantité d'albumine dans les urines. Une valeur basse est un bon signe de santé rénale et vasculaire.",
  },

  // ═══ LIPIDIQUE ═══════════════════════════════════════════════════════════
  {
    canonical: 'Cholestérol total', aliases: ['Cholestérol', 'CT', 'Cholesterol total', 'Cholesterol'],
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: 1.40, refHigh: 2.20, refOperator: 'range', category: 'lipides',
    explanation: "Somme des cholestérols transportés dans le sang. À interpréter avec le HDL et le LDL plutôt que seul.",
  },
  {
    canonical: 'HDL cholestérol', aliases: ['HDL', 'Cholestérol HDL', 'HDL-c', 'HDL cholesterol'],
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: 0.40, refHigh: null, refOperator: 'gt',
    bounds: { M: { low: 0.40, high: null }, F: { low: 0.50, high: null } }, category: 'lipides',
    explanation: "Le « bon » cholestérol — évacue les graisses des artères. Un HDL élevé est protecteur, soutenu par l'exercice d'endurance.",
  },
  {
    canonical: 'LDL cholestérol', aliases: ['LDL', 'Cholestérol LDL', 'LDL-c', 'LDL calculé', 'LDL cholesterol', 'LDL calcule'],
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: null, refHigh: 1.60, refOperator: 'lt', category: 'lipides',
    explanation: "Le « mauvais » cholestérol — peut s'accumuler dans les artères. Un LDL bas limite la formation de plaques sur le long terme.",
  },
  {
    canonical: 'VLDL', aliases: ['VLDL cholestérol', 'VLDL cholesterol'],
    unit: 'g/L', refLow: 0.10, refHigh: 0.40, refOperator: 'range', category: 'lipides',
    explanation: "Lipoprotéine qui transporte surtout les triglycérides. Suivie avec les autres lipides, elle complète la lecture de l'équilibre.",
  },
  {
    canonical: 'Triglycérides', aliases: ['TG', 'Triglycerides'],
    unit: 'g/L', unitAliases: ['mmol/L'], refLow: null, refHigh: 1.50, refOperator: 'lt', category: 'lipides',
    explanation: "Graisses circulantes issues de l'alimentation et des glucides. Un taux bas reflète un bon métabolisme énergétique.",
  },
  {
    canonical: 'Rapport LDL/HDL', aliases: ['LDL/HDL'],
    unit: 'ratio', refLow: null, refHigh: 3.5, refOperator: 'lt', category: 'lipides',
    explanation: "Compare le « mauvais » et le « bon » cholestérol. Un rapport bas traduit un profil lipidique favorable au cœur.",
  },
  {
    canonical: 'Rapport Cholestérol total/HDL', aliases: ['CT/HDL', 'Cholestérol total/HDL', 'Rapport CT/HDL', 'Cholesterol total/HDL'],
    unit: 'ratio', refLow: null, refHigh: 5.0, refOperator: 'lt', category: 'lipides',
    explanation: "Indicateur clé de l'équilibre lipidique global. Un ratio bas signale un bon partage entre cholestérol protecteur et à surveiller.",
  },
  {
    canonical: 'Apolipoprotéine B', aliases: ['ApoB', 'Apo B', 'Apolipoproteine B'],
    unit: 'g/L', refLow: 0.60, refHigh: 1.30, refOperator: 'range', category: 'lipides',
    explanation: "Reflète le nombre de particules athérogènes. Une valeur basse est associée à un meilleur profil cardiovasculaire.",
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
    unit: 'mmol/L', refLow: 2.20, refHigh: 2.60, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral clé des os, des muscles et de la coagulation. Une calcémie stable accompagne une bonne santé osseuse et musculaire.",
  },
  {
    canonical: 'Phosphore', aliases: ['Phosphorémie', 'Phosphate', 'Phosphates', 'Phosphoremie'],
    unit: 'mmol/L', refLow: 0.80, refHigh: 1.45, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral partenaire du calcium pour les os et l'énergie cellulaire. Une valeur dans la norme reflète un bon équilibre.",
  },
  {
    canonical: 'Magnésium', aliases: ['Magnésémie', 'Mg', 'Mg2+', 'Magnesium', 'Magnesemie'],
    unit: 'mmol/L', refLow: 0.70, refHigh: 1.00, refOperator: 'range', category: 'mineraux',
    explanation: "Minéral du muscle, de l'énergie et du sommeil. Un taux suffisant soutient la récupération et la détente nerveuse.",
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
    unit: 'mg/L', unitAliases: ['µmol/L'], refLow: null, refHigh: 12, refOperator: 'lt', category: 'foie',
    explanation: "Produit de dégradation des globules rouges, éliminé par le foie. Un taux normal confirme une bonne fonction hépatique.",
  },
  {
    canonical: 'Bilirubine conjuguée', aliases: ['Bilirubine directe', 'BIL D', 'Bilirubine conjuguee'],
    unit: 'mg/L', unitAliases: ['µmol/L'], refLow: null, refHigh: 3, refOperator: 'lt', category: 'foie',
    explanation: "Fraction de la bilirubine déjà traitée par le foie. Une valeur basse accompagne une bonne élimination hépatique.",
  },
  {
    canonical: 'Bilirubine libre', aliases: ['Bilirubine indirecte', 'Bilirubine non conjuguée', 'Bilirubine non conjuguee'],
    unit: 'mg/L', unitAliases: ['µmol/L'], refLow: null, refHigh: 10, refOperator: 'lt', category: 'foie',
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

  // ═══ PROTÉINES ═══════════════════════════════════════════════════════════
  {
    canonical: 'Protéines totales', aliases: ['Protidémie', 'Protéines sériques', 'Proteines totales', 'Protidemie'],
    unit: 'g/L', refLow: 65, refHigh: 80, refOperator: 'range', category: 'foie',
    explanation: "Ensemble des protéines du sang (albumine + globulines). Une valeur dans la norme reflète un bon état nutritionnel et hépatique.",
  },
  {
    canonical: 'Albumine', aliases: ['Albuminémie', 'Albuminemie'],
    unit: 'g/L', refLow: 38, refHigh: 50, refOperator: 'range', category: 'foie',
    explanation: "Principale protéine du sang, fabriquée par le foie. Un taux dans la norme accompagne un bon état nutritionnel et hépatique.",
  },
  {
    canonical: 'Ferritine', aliases: ['Ferritinémie', 'Ferritinemie'],
    unit: 'µg/L', refLow: 30, refHigh: 300, refOperator: 'range',
    bounds: { M: { low: 30, high: 400 }, F: { low: 15, high: 200 } }, category: 'mineraux',
    explanation: "Reflète les réserves de fer de l'organisme. Un taux suffisant soutient l'énergie, l'endurance et l'oxygénation des tissus.",
  },
  {
    canonical: 'Transferrine', aliases: ['Sidérophiline', 'Siderophiline'],
    unit: 'g/L', refLow: 2.0, refHigh: 4.0, refOperator: 'range', category: 'mineraux',
    explanation: "Protéine de transport du fer dans le sang. Une valeur dans la norme accompagne une bonne gestion du fer.",
  },
  {
    canonical: 'Coefficient de saturation de la transferrine', aliases: ['CST', 'Saturation de la transferrine', 'Coefficient de saturation', 'CS transferrine', 'Saturation transferrine'],
    unit: '%', refLow: 20, refHigh: 40, refOperator: 'range', category: 'mineraux',
    explanation: "Part de la transferrine occupée par du fer. Dans la norme, elle indique une bonne disponibilité du fer.",
  },
  {
    canonical: 'Fer sérique', aliases: ['Fer', 'Sidérémie', 'Fer serique', 'Sideremie'],
    unit: 'µmol/L', unitAliases: ['µg/dL'], refLow: 11, refHigh: 31, refOperator: 'range',
    bounds: { M: { low: 11, high: 28 }, F: { low: 9, high: 30 } }, category: 'mineraux',
    explanation: "Fer circulant dans le sang. À lire avec la ferritine et la saturation, il complète le bilan du fer.",
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
    canonical: 'Anticorps anti-TPO', aliases: ['Anti-TPO', 'Ac anti-thyropéroxydase', 'Anticorps anti-thyroperoxydase', 'Anti TPO', 'AcTPO'],
    unit: 'UI/mL', refLow: null, refHigh: 34, refOperator: 'lt', category: 'thyroide',
    explanation: "Anticorps dirigés contre une enzyme thyroïdienne. Une valeur basse indique l'absence d'auto-immunité thyroïdienne active.",
  },
  {
    canonical: 'Anticorps anti-thyroglobuline', aliases: ['Anti-TG', 'Ac anti-thyroglobuline', 'Anticorps anti-Tg', 'Anti TG', 'AcTG'],
    unit: 'UI/mL', refLow: null, refHigh: 115, refOperator: 'lt', category: 'thyroide',
    explanation: "Anticorps dirigés contre une protéine thyroïdienne. Une valeur basse est un signe favorable pour la thyroïde.",
  },

  // ═══ VITAMINES ═══════════════════════════════════════════════════════════
  {
    canonical: '25-OH Vitamine D', aliases: ['Vitamine D', '25-(OH)-Vitamine D (D2+D3)', '25 OH vitamine D', 'Vit D', 'Vitamine D3', '25 OH Vitamine D', '25-OH-vitamine D'],
    unit: 'ng/mL', unitAliases: ['nmol/L'], refLow: 30, refHigh: 60, refOperator: 'range', category: 'vitamines',
    explanation: "Soutient les os, les muscles et l'immunité. Un statut suffisant, surtout en hiver, contribue au tonus et à la solidité osseuse.",
  },
  {
    canonical: 'Vitamine B12', aliases: ['B12', 'Cobalamine', 'Vit B12', 'Vitamine B 12'],
    unit: 'pg/mL', unitAliases: ['pmol/L'], refLow: 200, refHigh: 900, refOperator: 'range', category: 'vitamines',
    explanation: "Essentielle aux nerfs et à la formation des globules rouges. Un statut suffisant soutient l'énergie et la concentration.",
  },
  {
    canonical: 'Folates', aliases: ['B9', 'Folates sériques', 'Acide folique', 'Vitamine B9', 'Folate', 'Folates seriques'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: 3.1, refHigh: 20, refOperator: 'range', category: 'vitamines',
    explanation: "Vitamine clé du renouvellement cellulaire et de la formation du sang. Un statut suffisant soutient la vitalité.",
  },

  // ═══ HORMONES COURANTES ══════════════════════════════════════════════════
  {
    canonical: 'Testostérone', aliases: ['Testostérone totale', 'Testostéronémie', 'Testosterone', 'Testosterone totale'],
    unit: 'µg/L', unitAliases: ['ng/mL', 'nmol/L'], refLow: 2.5, refHigh: 9.0, refOperator: 'range',
    bounds: { M: { low: 2.5, high: 9.0 }, F: { low: 0.1, high: 0.8 } }, category: 'hormones',
    explanation: "Hormone clé de la masse musculaire, de la libido et de l'énergie. Une valeur dans la norme accompagne un bon équilibre hormonal.",
  },
  {
    canonical: 'Cortisol', aliases: ['Cortisol 8h', 'Cortisolémie', 'Cortisol (8h)', 'Cortisolemie'],
    unit: 'µg/dL', unitAliases: ['nmol/L'], refLow: 6, refHigh: 19, refOperator: 'range', category: 'hormones',
    explanation: "Hormone du stress et du réveil, plus élevée le matin. Une valeur matinale dans la norme reflète un bon rythme.",
  },
  {
    canonical: 'PSA', aliases: ['Antigène prostatique spécifique', 'PSA total', 'Antigene prostatique specifique'],
    unit: 'µg/L', unitAliases: ['ng/mL'], refLow: null, refHigh: 4.0, refOperator: 'lt', category: 'hormones',
    explanation: "Protéine produite par la prostate, suivie surtout chez l'homme. Une valeur basse est un repère de routine rassurant.",
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

/** Gère virgule décimale FR, séparateurs de milliers (espaces/points), signes. */
export function normalizeNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  let s = String(input).trim()
  if (!s) return null
  // retire tous les espaces (séparateurs de milliers, y compris insécables/fins)
  s = s.replace(/[\s   ]/g, '')
  const hasComma = s.includes(',')
  const hasDot = s.includes('.')
  if (hasComma && hasDot) {
    // '.' = milliers, ',' = décimale
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    s = s.replace(',', '.')
  }
  s = s.replace(/[^0-9.\-]/g, '')
  if (!s || s === '-' || s === '.') return null
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : null
}

/**
 * Normalise une unité brute via la table d'alias. Le référentiel fait autorité :
 * si une unité canonique est fournie, elle l'emporte sauf alias explicite.
 */
export function normalizeUnit(rawUnit: string | null | undefined, canonicalUnit?: string): string {
  if (!rawUnit || !rawUnit.trim()) return canonicalUnit ?? ''
  const key = rawUnit.trim().replace(/\s+/g, '').toLowerCase()
  if (UNIT_ALIASES[key]) return UNIT_ALIASES[key]
  if (canonicalUnit && key === canonicalUnit.replace(/\s+/g, '').toLowerCase()) return canonicalUnit
  return canonicalUnit ?? rawUnit.trim()
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

/**
 * Retrouve une entrée par nom canonique OU alias, normalisé. Tolère les
 * qualificatifs entre parenthèses (ex. "ASAT (TGO)" → "ASAT").
 */
export function matchMarker(rawName: string | null | undefined): MarkerReference | undefined {
  if (!rawName) return undefined
  const direct = REFERENCE_INDEX.get(normalizeName(rawName))
  if (direct) return direct
  const noParen = normalizeName(String(rawName).replace(/\([^)]*\)/g, ' '))
  if (noParen) {
    const e = REFERENCE_INDEX.get(noParen)
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

// ─── Complétion d'un marqueur extrait (MODIF 2 / sous-étape C) ───────────────

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
 * unité, bornes, catégorie et explication manquantes. Les valeurs déjà
 * présentes sont conservées. Marqueur absent → `needsReview`.
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
