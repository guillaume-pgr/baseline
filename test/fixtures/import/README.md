# Fixtures d'import — contrat de test (RGPD strict)

Ces fixtures protègent le **chemin critique de l'import de prise de sang** (voir
`CLAUDE.md` → « ⛔ CHEMIN CRITIQUE »). Elles sont **100 % synthétiques** : aucune
donnée réelle (pas de nom, INS, adresse, RPPS, ni PDF d'un patient réel).

## `vision-responses/` — le contrat déterministe
Réponses **synthétiques** de l'outil `record_lab_report` (sortie Claude Vision),
au format `RawExtraction`. Les tests les **rejouent** (`pnpm run test:import`)
sans aucun appel API → rapide, hors-ligne, gratuit, sans flakiness.

| Fichier | Cas couvert | Bilans attendus |
|---|---|---|
| `mono-date.json` | mono-date simple + lignes témoin/technique à exclure | **1** |
| `multi-date-cofrac.json` | multi-dates Cofrac, HbA1c à cadence propre | **3** (2026-03-02 · 2025-04-25 · 2024-08-23) |
| `edge-biunit-partial.json` | marqueur bi-unités + antériorité partielle | **2** (2026-03-02 · 2025-04-25) |

> Si un test devient rouge, **c'est une régression du pipeline**, pas un test à
> assouplir. Les fixtures sont le contrat.

## `pdfs/` — pour le smoke « live » (optionnel)
Le smoke `pnpm run test:import:live` (OPT-IN, jamais en CI) appelle réellement
Vision pour détecter une dérive de prompt/schéma. Il attend un PDF **synthétique**
`pdfs/multi-date-cofrac.pdf` (à créer soi-même, sans données réelles) et
`ANTHROPIC_API_KEY`. Ce dossier est volontairement vide par défaut.

## Mettre à jour le contrat
Quand le format Vision évolue **volontairement**, régénère la réponse JSON
correspondante (idéalement capturée une fois sur un PDF synthétique) et
adapte les invariants. Ne modifie jamais une fixture juste pour faire passer
un test au vert.
