/**
 * Référentiel local et exhaustif des marqueurs sanguins courants.
 *
 * Source UNIQUE pour compléter, de façon déterministe (zéro appel API),
 * les champs manquants après extraction : unité canonique, seuils de
 * référence, catégorie (= organ_system, compatible realDataAdapter) et
 * explication wellness.
 *
 * `category` reprend les clés de groupe de realDataAdapter
 * (hematologie, lipides, glucides, foie, reins, thyroide, vitamines, mineraux)
 * afin que le regroupement et les couleurs restent cohérents.
 *
 * Style des explications : 1–2 phrases, vocabulaire bien-être, jamais de
 * diagnostic — aligné sur MARKER_EXPLANATIONS (src/data/bloodwork-data.ts).
 */

export interface MarkerReference {
  canonical: string
  aliases: string[]
  unit: string
  refMin: number | null
  refMax: number | null
  category: string
  explanation: string
}

export const BLOOD_MARKERS_REFERENCE: MarkerReference[] = [
  // ─── Hématologie ────────────────────────────────────────────────────────
  {
    canonical: 'Leucocytes', aliases: ['GB'], unit: '/mm3',
    refMin: 4000, refMax: 11000, category: 'hematologie',
    explanation: "Globules blancs — première ligne de défense immunitaire. Un taux dans la norme indique l'absence d'infection ou d'inflammation active en cours.",
  },
  {
    canonical: 'Polynucléaires neutrophiles', aliases: ['PNN', 'Neutrophiles'], unit: '/mm3',
    refMin: 1400, refMax: 7700, category: 'hematologie',
    explanation: "Globules blancs les plus nombreux, mobilisés face aux bactéries. Un taux équilibré reflète une immunité réactive et au repos.",
  },
  {
    canonical: 'Polynucléaires éosinophiles', aliases: ['Éosinophiles'], unit: '/mm3',
    refMin: 20, refMax: 630, category: 'hematologie',
    explanation: "Globules blancs impliqués dans les réactions allergiques et la réponse aux parasites. Un taux bas et stable est le signe d'un terrain peu réactif.",
  },
  {
    canonical: 'Polynucléaires basophiles', aliases: ['Basophiles'], unit: '/mm3',
    refMin: null, refMax: 110, category: 'hematologie',
    explanation: "Globules blancs les plus rares, liés aux réactions inflammatoires. Un taux bas dans la norme est parfaitement habituel.",
  },
  {
    canonical: 'Lymphocytes', aliases: [], unit: '/mm3',
    refMin: 1000, refMax: 4800, category: 'hematologie',
    explanation: "Globules blancs de la mémoire immunitaire (anticorps, défense ciblée). Un taux stable soutient une bonne capacité d'adaptation aux agressions.",
  },
  {
    canonical: 'Monocytes', aliases: [], unit: '/mm3',
    refMin: 150, refMax: 1000, category: 'hematologie',
    explanation: "Grands globules blancs qui nettoient les débris cellulaires et soutiennent la réparation des tissus. Un taux normal accompagne une récupération saine.",
  },
  {
    canonical: 'Hématies', aliases: ['GR', 'Globules rouges'], unit: '10^6/mm3',
    refMin: 4.28, refMax: 6.00, category: 'hematologie',
    explanation: "Globules rouges qui transportent l'oxygène vers les muscles et les organes. Un nombre optimal soutient l'énergie et l'endurance au quotidien.",
  },
  {
    canonical: 'Hémoglobine', aliases: ['Hb'], unit: 'g/dL',
    refMin: 13.0, refMax: 18.0, category: 'hematologie',
    explanation: "Transporte l'oxygène dans le sang. Un taux optimal soutient l'énergie et l'endurance ; trop bas, il peut se traduire par de la fatigue.",
  },
  {
    canonical: 'Hématocrite', aliases: ['Ht'], unit: '%',
    refMin: 39, refMax: 53, category: 'hematologie',
    explanation: "Proportion de globules rouges dans le sang. Stable dans la norme, c'est le signe d'un sang bien équilibré et d'une bonne hydratation.",
  },
  {
    canonical: 'VGM', aliases: ['Volume globulaire moyen'], unit: 'fL',
    refMin: 78, refMax: 98, category: 'hematologie',
    explanation: "Volume moyen des globules rouges. Un VGM normal accompagné d'une hémoglobine stable est un excellent signal d'équilibre.",
  },
  {
    canonical: 'TCMH', aliases: ['Teneur corpusculaire moyenne en hémoglobine'], unit: 'pg',
    refMin: 26, refMax: 34, category: 'hematologie',
    explanation: "Quantité moyenne d'hémoglobine par globule rouge. Dans la norme, elle confirme une bonne qualité du transport de l'oxygène.",
  },
  {
    canonical: 'CCMH', aliases: ['Concentration corpusculaire moyenne en hémoglobine'], unit: 'g/dL',
    refMin: 31, refMax: 36.5, category: 'hematologie',
    explanation: "Concentration d'hémoglobine dans les globules rouges. Une valeur stable dans la norme reflète des globules rouges sains.",
  },
  {
    canonical: 'Plaquettes', aliases: ['Thrombocytes'], unit: 'Milliers/mm3',
    refMin: 150, refMax: 400, category: 'hematologie',
    explanation: "Impliquées dans la coagulation. Un taux stable dans la norme protège des saignements sans favoriser la formation de caillots.",
  },

  // ─── Hémostase ──────────────────────────────────────────────────────────
  {
    canonical: 'Taux de prothrombine', aliases: ['TP'], unit: '%',
    refMin: 70, refMax: 100, category: 'hematologie',
    explanation: "Évalue la rapidité de coagulation du sang. Un taux dans la norme indique un bon équilibre de la coagulation, soutenu notamment par la vitamine K.",
  },

  // ─── Glucidique ─────────────────────────────────────────────────────────
  {
    canonical: 'Glycémie à jeun', aliases: ['Glycémie'], unit: 'g/L',
    refMin: 0.70, refMax: 1.10, category: 'glucides',
    explanation: "Taux de sucre dans le sang à jeun. Stable dans la zone verte, il reflète une bonne sensibilité à l'insuline et un métabolisme équilibré.",
  },
  {
    canonical: 'Hémoglobine glyquée', aliases: ['HbA1c', 'Hémoglobine glycosylée A1c'], unit: '%',
    refMin: 4.0, refMax: 6.0, category: 'glucides',
    explanation: "Reflet de la glycémie moyenne sur 3 mois. Une valeur basse confirme une stabilité glucidique durable, signe d'une bonne santé métabolique.",
  },

  // ─── Rénal ──────────────────────────────────────────────────────────────
  {
    canonical: 'Créatinine', aliases: [], unit: 'mg/L',
    refMin: 6.0, refMax: 12.0, category: 'reins',
    explanation: "Déchet musculaire filtré par les reins. Stable dans la norme, elle confirme une bonne fonction rénale — à nuancer si l'apport protéique est très élevé.",
  },
  {
    canonical: 'DFG (CKD-EPI)', aliases: ['Estimation du DFG', 'Débit de filtration glomérulaire', 'DFG'], unit: 'mL/min',
    refMin: 90, refMax: null, category: 'reins',
    explanation: "Estime la capacité de filtration des reins. Un DFG élevé est le signe d'une excellente fonction rénale, protectrice sur le long terme.",
  },

  // ─── Lipidique ──────────────────────────────────────────────────────────
  {
    canonical: 'Triglycérides', aliases: [], unit: 'g/L',
    refMin: 0.40, refMax: 1.60, category: 'lipides',
    explanation: "Graisses circulantes issues de l'alimentation et des glucides. Un taux bas reflète un bon métabolisme énergétique et un faible risque cardiovasculaire.",
  },
  {
    canonical: 'Cholestérol total', aliases: [], unit: 'g/L',
    refMin: 1.40, refMax: 2.20, category: 'lipides',
    explanation: "Somme des cholestérols transportés dans le sang. À interpréter avec le HDL et le LDL plutôt que seul, pour situer l'équilibre lipidique.",
  },
  {
    canonical: 'HDL cholestérol', aliases: ['HDL'], unit: 'g/L',
    refMin: 0.40, refMax: null, category: 'lipides',
    explanation: "Le « bon » cholestérol — évacue les graisses des artères. Un HDL élevé est protecteur, soutenu par l'exercice d'endurance et les oméga-3.",
  },
  {
    canonical: 'VLDL', aliases: [], unit: 'g/L',
    refMin: null, refMax: null, category: 'lipides',
    explanation: "Lipoprotéine qui transporte surtout les triglycérides. Suivie avec les autres lipides, elle complète la lecture de l'équilibre lipidique.",
  },
  {
    canonical: 'LDL cholestérol', aliases: ['LDL', 'LDL calculé'], unit: 'g/L',
    refMin: 0.60, refMax: 1.55, category: 'lipides',
    explanation: "Le « mauvais » cholestérol — peut s'accumuler dans les artères. Un LDL bas limite la formation de plaques sur le long terme.",
  },
  {
    canonical: 'Rapport LDL/HDL', aliases: ['LDL/HDL'], unit: 'ratio',
    refMin: null, refMax: 3.5, category: 'lipides',
    explanation: "Compare le « mauvais » et le « bon » cholestérol. Un rapport bas traduit un profil lipidique favorable au cœur et aux vaisseaux.",
  },
  {
    canonical: 'Rapport Cholestérol total/HDL', aliases: ['Cholestérol total/HDL', 'Rapport CT/HDL'], unit: 'ratio',
    refMin: null, refMax: 5.0, category: 'lipides',
    explanation: "Indicateur clé de l'équilibre lipidique global. Un ratio bas signale un bon partage entre cholestérol protecteur et cholestérol à surveiller.",
  },

  // ─── Ionogramme ─────────────────────────────────────────────────────────
  {
    canonical: 'Sodium', aliases: ['Na'], unit: 'mmol/L',
    refMin: 135, refMax: 145, category: 'mineraux',
    explanation: "Électrolyte clé de l'équilibre hydrique et de la pression artérielle. Stable dans la norme, il reflète une bonne hydratation.",
  },
  {
    canonical: 'Potassium', aliases: ['K'], unit: 'mmol/L',
    refMin: 3.5, refMax: 4.6, category: 'mineraux',
    explanation: "Électrolyte essentiel à la contraction musculaire et au rythme cardiaque. Un taux dans la norme soutient un cœur et des muscles sereins.",
  },
  {
    canonical: 'Chlore', aliases: ['Cl'], unit: 'mmol/L',
    refMin: 95, refMax: 106, category: 'mineraux',
    explanation: "Électrolyte qui accompagne le sodium dans l'équilibre acido-basique et hydrique. Une valeur stable dans la norme est un bon repère d'équilibre.",
  },
  {
    canonical: 'Bilirubine totale', aliases: ['Bilirubine'], unit: 'mg/L',
    refMin: null, refMax: 12.0, category: 'foie',
    explanation: "Produit de dégradation des globules rouges, éliminé par le foie. Un taux normal confirme une bonne fonction hépatique et un renouvellement sanguin physiologique.",
  },

  // ─── Enzymologie ────────────────────────────────────────────────────────
  {
    canonical: 'ASAT', aliases: ['SGOT', 'S.G.O.T', 'TGO'], unit: 'UI/L',
    refMin: null, refMax: 35, category: 'foie',
    explanation: "Enzyme du foie et des muscles. Elle peut monter légèrement après une séance intense — un pic isolé n'a en général rien de préoccupant.",
  },
  {
    canonical: 'ALAT', aliases: ['SGPT', 'S.G.P.T', 'TGP'], unit: 'UI/L',
    refMin: null, refMax: 45, category: 'foie',
    explanation: "Enzyme plus spécifique du foie. Un taux stable et dans la norme indique l'absence de surcharge hépatique active.",
  },
  {
    canonical: 'Phosphatases alcalines', aliases: ['PAL'], unit: 'UI/L',
    refMin: null, refMax: 130, category: 'foie',
    explanation: "Enzyme partagée entre le foie et les os. Une valeur stable dans la norme suggère une bonne santé hépatique et osseuse.",
  },
  {
    canonical: 'GGT', aliases: ['Gamma GT', 'Gamma glutamyl transférase'], unit: 'UI/L',
    refMin: null, refMax: 55, category: 'foie',
    explanation: "Enzyme sensible à l'alcool et à certains médicaments. Un taux bas est un bon signe de santé hépatique globale.",
  },
  {
    canonical: 'LDH', aliases: ['Lactate déshydrogénase'], unit: 'U/L',
    refMin: null, refMax: 245, category: 'foie',
    explanation: "Enzyme présente dans de nombreux tissus, marqueur général d'activité cellulaire. Une valeur dans la norme accompagne un fonctionnement équilibré.",
  },

  // ─── Protéines / Fer ────────────────────────────────────────────────────
  {
    canonical: 'Ferritine', aliases: [], unit: 'µg/L',
    refMin: 30, refMax: 300, category: 'mineraux',
    explanation: "Reflète les réserves de fer de l'organisme. Un taux suffisant soutient l'énergie, l'endurance et une bonne oxygénation des tissus.",
  },

  // ─── Thyroïde ───────────────────────────────────────────────────────────
  {
    canonical: 'TSH', aliases: ['TSH us'], unit: 'mUI/L',
    refMin: 0.35, refMax: 4.90, category: 'thyroide',
    explanation: "Hormone qui régule la thyroïde, chef d'orchestre du métabolisme. Stable dans la norme, elle accompagne une bonne régulation de l'énergie.",
  },

  // ─── Vitamines ──────────────────────────────────────────────────────────
  {
    canonical: '25-OH Vitamine D', aliases: ['Vitamine D', '25-(OH)-Vitamine D (D2+D3)'], unit: 'ng/mL',
    refMin: 30, refMax: 60, category: 'vitamines',
    explanation: "Soutient les os, les muscles et l'immunité. Un statut suffisant, surtout en hiver, contribue au tonus et à la solidité osseuse.",
  },
]

// ─── Lookup déterministe par nom normalisé ──────────────────────────────────

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[^a-z0-9]+/g, ' ') // ponctuation → espace
    .trim()
}

// Index normalisé : nom canonique + chaque alias → entrée.
const REFERENCE_INDEX: Map<string, MarkerReference> = (() => {
  const map = new Map<string, MarkerReference>()
  for (const entry of BLOOD_MARKERS_REFERENCE) {
    map.set(normalize(entry.canonical), entry)
    for (const alias of entry.aliases) {
      const key = normalize(alias)
      if (!map.has(key)) map.set(key, entry)
    }
  }
  return map
})()

/**
 * Retrouve une entrée du référentiel par nom canonique OU alias,
 * après normalisation (minuscules, sans accents, sans ponctuation).
 */
export function matchMarker(name: string | null | undefined): MarkerReference | undefined {
  if (!name) return undefined
  return REFERENCE_INDEX.get(normalize(name))
}

// Champs complétés de façon déterministe depuis le référentiel (MODIF 2).
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
 * Complète un marqueur extrait à partir du référentiel local, sans appel API :
 * unité, seuils, catégorie et explication manquants sont remplis depuis l'entrée
 * trouvée par matchMarker. Les valeurs déjà présentes (unité, seuils saisis) sont
 * conservées. Un marqueur absent du référentiel est gardé tel quel et marqué
 * `needsReview` pour être complété manuellement à l'écran de validation.
 */
export function completeMarkerFromReference<T extends CompletableMarker>(m: T): T {
  const ref = matchMarker(m.markerName) ?? matchMarker(m.markerCode)
  if (!ref) {
    return { ...m, needsReview: true }
  }
  return {
    ...m,
    unit: isBlank(m.unit) ? ref.unit : m.unit,
    refMin: m.refMin === null || m.refMin === undefined ? ref.refMin : m.refMin,
    refMax: m.refMax === null || m.refMax === undefined ? ref.refMax : m.refMax,
    organSystem: ref.category,
    explanation: ref.explanation,
    needsReview: false,
  }
}
