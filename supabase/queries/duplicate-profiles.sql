-- =========================================
-- PROFILS EN DOUBLON — détection & nettoyage
-- =========================================
-- profiles.user_id doit être UNIQUE (contrainte garantie par 0005). Si deux
-- lignes partageaient le même user_id, la lecture .single() du gating échouerait
-- et l'app afficherait un faux statut « pending ». À exécuter dans le SQL Editor.

-- ─────────────────────────────────────────
-- 1) DÉTECTER les user_id en double
-- ─────────────────────────────────────────
select user_id, count(*) as n
from profiles
group by user_id
having count(*) > 1
order by n desc;

-- ─────────────────────────────────────────
-- 1bis) Voir le détail des lignes en double
-- ─────────────────────────────────────────
select p.*
from profiles p
join (
  select user_id
  from profiles
  group by user_id
  having count(*) > 1
) d on d.user_id = p.user_id
order by p.user_id, p.created_at;

-- ─────────────────────────────────────────
-- 2) SUPPRIMER les doublons (garde la meilleure ligne par user_id)
--    Priorité conservée : approuvé > profil renseigné > plus ancien.
-- ─────────────────────────────────────────
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id
      order by
        (status in ('approved_premium', 'approved_free')) desc,
        (coalesce(first_name, '') <> '') desc,
        created_at asc
    ) as rn
  from profiles
)
delete from profiles p
using ranked r
where p.id = r.id
  and r.rn > 1;

-- ─────────────────────────────────────────
-- 3) VÉRIFIER qu'il ne reste aucun doublon (doit renvoyer 0 ligne)
-- ─────────────────────────────────────────
select user_id, count(*)
from profiles
group by user_id
having count(*) > 1;
