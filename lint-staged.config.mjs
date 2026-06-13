// Pre-commit guard du CHEMIN CRITIQUE — import de prise de sang.
// Si un fichier du pipeline est modifié, on lance `pnpm run test:import`
// (rapide, hors-ligne). La valeur est une FONCTION qui renvoie une commande
// constante → lint-staged n'ajoute PAS les noms de fichiers en arguments
// (sinon vitest les prendrait pour des filtres et ne lancerait rien).

const CRITICAL_PATH = [
  'src/lib/health/blood-markers-reference.ts',
  'src/lib/health/reconcile.ts',
  'src/lib/health/verify.ts',
  'src/lib/health/group-panels.ts',
  'src/lib/health/merge-panel.ts',
  'src/lib/health/marker-status.ts',
  'src/lib/health/blood-panel-parser.ts',
  'src/lib/health/gating.ts',
  'src/app/api/health/extract/route.ts',
  'src/app/api/health/import/route.ts',
  'src/lib/context/useRealBloodPanels.ts',
]

export default {
  '*': (files) => {
    const normalized = files.map((f) => f.replace(/\\/g, '/'))
    const touched = normalized.some((f) => CRITICAL_PATH.some((c) => f.endsWith(c)))
    return touched ? ['pnpm run test:import'] : []
  },
}
