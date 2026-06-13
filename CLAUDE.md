@AGENTS.md

# ⛔ CHEMIN CRITIQUE — IMPORT PRISE DE SANG

L'import de prise de sang (extraction Claude Vision → normalisation →
regroupement en bilans datés → dédup → écriture Supabase → affichage) est le
cœur de Lyvio. Il a déjà cassé deux fois (résultats non affichés ; antériorité
ignorée). **Zone protégée.**

## Fichiers du pipeline (ne pas toucher sans filet)
- `src/app/api/health/extract/route.ts` — route d'extraction Vision (prompt + schéma de l'outil `record_lab_report`).
- `src/lib/health/reconcile.ts` — normalisation : matching, conversion d'unités, bornes, antériorités.
- `src/lib/health/blood-markers-reference.ts` — référentiel des marqueurs (unités canoniques, conversions, intervalles, explications).
- `src/lib/health/verify.ts` — auto-vérification + flag « à vérifier ».
- `src/lib/health/group-panels.ts` — regroupement en bilans datés (1 par date distincte).
- `src/lib/health/merge-panel.ts` — dédup/merge par (utilisateur, date), sans écrasement.
- `src/lib/health/marker-status.ts` — statut déterministe (range/lt/gt/none).
- `src/lib/health/blood-panel-parser.ts` — types + validation avant écriture.
- `src/lib/health/gating.ts` — résolution du profil (auth.uid) + droits d'import.
- `src/app/api/health/import/route.ts` — écriture Supabase (insert/merge) sous auth.uid().
- `src/lib/context/useRealBloodPanels.ts` — lecture/affichage (doit filtrer le MÊME profil que l'écriture).

## Règle (impérative)
Toute modification touchant un de ces fichiers **DOIT** lancer `pnpm run test:import`
et il **DOIT être 100 % vert avant tout commit/déploiement. Ne jamais committer rouge.**

Les fixtures de `test/fixtures/import/` sont **le contrat** : si un test devient
rouge, **c'est une régression, pas un test à assouplir.** On corrige le code, pas
le test (sauf changement de format Vision volontaire — alors on régénère la
fixture ET on adapte les invariants).

## Filet en place
- `pnpm run test:import` — suite déterministe, hors-ligne (aucun appel API, aucune vraie DB), rapide.
- **Hook pre-commit** (husky + lint-staged) : lance `test:import` dès qu'un fichier du chemin critique est modifié → bloque le commit si rouge.
- **CI** (`.github/workflows/import-guard.yml`) : `test:import` sur chaque push/PR ; à rendre « required » sur `master`.
- `pnpm run test:import:live` — smoke OPT-IN (vrai appel Vision), jamais en CI.
