# Waitlist Lyvio — Guide d'accès

## Appliquer la migration SQL

1. Ouvre [Supabase Dashboard](https://supabase.com/dashboard) → ton projet
2. Va dans **SQL Editor**
3. Colle et exécute le contenu de `supabase/migrations/0002_waitlist.sql`

## Consulter les inscrits

- **Supabase Dashboard → Table Editor → table `waitlist`**
- Chaque ligne contient : `email`, `created_at`, `source`

## Exporter en CSV

- Dans Table Editor, clique sur **Export → CSV** en haut à droite
- Ou via SQL Editor :
  ```sql
  select email, created_at from waitlist order by created_at desc;
  ```

## Source des inscriptions

Les emails proviennent du bouton "Être prévenu·e au lancement" dans la
modal "Bientôt disponible" (mode réel). La colonne `source` vaut
`demo_real_mode` par défaut.
