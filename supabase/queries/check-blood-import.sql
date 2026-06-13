-- =========================================
-- DIAGNOSTIC — import de prise de sang qui ne s'affiche pas
-- =========================================
-- À exécuter dans Supabase SQL Editor (remplace l'email par celui du compte).

-- ─────────────────────────────────────────
-- 1) L'utilisateur a-t-il EXACTEMENT une ligne profiles ?
--    0 ligne (orphelin) ou 2+ (doublon) cassaient la lecture .single() côté
--    gating (import bloqué) ET côté affichage (empty state silencieux).
-- ─────────────────────────────────────────
select u.id as user_id, u.email, count(p.id) as nb_profiles
from auth.users u
left join profiles p on p.user_id = u.id
where u.email = 'REMPLACE@email.com'
group by u.id, u.email;

-- ─────────────────────────────────────────
-- 2) La donnée EST-elle en base ? (bilans + nb de marqueurs)
-- ─────────────────────────────────────────
select bp.id as panel_id, bp.panel_date, bp.lab_name, bp.created_at,
       count(bm.id) as nb_marqueurs
from blood_panels bp
join profiles p on p.id = bp.profile_id
join auth.users u on u.id = p.user_id
left join blood_markers bm on bm.panel_id = bp.id
where u.email = 'REMPLACE@email.com'
group by bp.id
order by bp.created_at desc;

-- ─────────────────────────────────────────
-- 3) RLS : INSERT et SELECT doivent être cohérents sur blood_panels/blood_markers.
--    On doit voir une policy 'for all' (cmd = ALL) couvrant select + insert.
-- ─────────────────────────────────────────
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where tablename in ('blood_panels', 'blood_markers')
order by tablename, policyname;

-- ─────────────────────────────────────────
-- 4) RLS activée sur les tables ? (rowsecurity doit être true)
-- ─────────────────────────────────────────
select relname, relrowsecurity
from pg_class
where relname in ('blood_panels', 'blood_markers');
