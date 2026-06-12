-- =========================================
-- COMPTES ORPHELINS — détection & rattrapage
-- =========================================
-- Un compte « orphelin » existe dans auth.users mais n'a pas de ligne
-- correspondante dans profiles. Depuis la migration 0004_profile_trigger,
-- le trigger les évite, mais ces requêtes servent à auditer / réparer.
-- À exécuter dans Supabase SQL Editor.

-- ─────────────────────────────────────────
-- 1) DÉTECTER les comptes orphelins
-- ─────────────────────────────────────────
select
  u.id            as user_id,
  u.email,
  u.created_at,
  u.confirmed_at
from auth.users u
left join profiles p on p.user_id = u.id
where p.user_id is null
order by u.created_at desc;

-- ─────────────────────────────────────────
-- 2) RATTRAPER (créer les profils manquants)
-- ─────────────────────────────────────────
-- IMPORTANT : profiles.first_name est NOT NULL (sans défaut) → il faut fournir
-- une valeur. On insère '' (placeholder) ; l'utilisateur complétera son prénom
-- à l'onboarding. Idempotent grâce à on conflict (user_id) do nothing.
insert into profiles (user_id, first_name, status, is_admin, current_mode)
select u.id, '', 'pending', false, 'demo'
from auth.users u
left join profiles p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;

-- ─────────────────────────────────────────
-- 3) VÉRIFIER qu'il ne reste aucun orphelin (doit renvoyer 0)
-- ─────────────────────────────────────────
select count(*) as orphelins_restants
from auth.users u
left join profiles p on p.user_id = u.id
where p.user_id is null;
