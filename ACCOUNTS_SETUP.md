# Lyvio — Gestion des comptes utilisateurs

## 1. Appliquer la migration SQL

Dans Supabase Dashboard → **SQL Editor**, exécute le contenu de
`supabase/migrations/0003_accounts.sql`.

Cela ajoute à la table `profiles` :
- `status` — statut du compte (`pending` par défaut)
- `is_admin` — flag administrateur
- `cgv_accepted_at` — date d'acceptation des CGV
- `approved_at` — date d'approbation
- `last_chat_question_at` — dernière question IA (limite 1/jour premium)

---

## 2. Approuver un compte

**Supabase Dashboard → Table Editor → table `profiles`**

1. Trouve la ligne de l'utilisateur (colonne `email` via la jointure,
   ou filtre sur `first_name`)
2. Clique sur la cellule `status`
3. Change la valeur :
   - `approved_free` → accès gratuit (1 prise de sang, pas d'apps)
   - `approved_premium` → accès complet

Tu peux aussi remplir `approved_at` avec la date courante.

---

## 3. Se définir comme admin

Dans Table Editor → `profiles`, trouve ta ligne et passe `is_admin` à `true`.

L'admin (`ADMIN_EMAIL` dans `src/lib/config.ts`) bypass tous les gates
et voit l'application complète sans restriction.

---

## 4. Statuts disponibles

| Statut | Accès |
|--------|-------|
| `pending` | Mode démo John/Jane uniquement. Mode réel verrouillé. |
| `approved_free` | Mode réel + 1 prise de sang. Pages Compo/VO2/Sommeil/Microbiote verrouillées. |
| `approved_premium` | Tout débloqué. Chat IA 1 question/jour. |
| `rejected` | Message "compte non validé". |

---

## 5. Email de l'admin

Défini dans `src/lib/config.ts` :
```ts
export const ADMIN_EMAIL = 'guillaume.pgraziani@gmail.com'
```

Modifie cette valeur si l'adresse change.

---

## 6. Emails d'approbation (sous-étape E)

Voir la section Resend dans ce fichier après la mise en place de
l'email automatique.
