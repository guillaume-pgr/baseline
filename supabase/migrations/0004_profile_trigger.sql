-- =========================================
-- CRÉATION AUTOMATIQUE DU PROFIL À L'INSCRIPTION
-- =========================================
-- Problème corrigé : un compte pouvait exister dans auth.users sans ligne
-- `profiles` correspondante (si l'onboarding n'était pas terminé ou échouait),
-- rendant le compte impossible à approuver et sans statut.
--
-- Solution : un trigger Postgres crée la ligne `profiles` dès la création de
-- l'utilisateur auth.users. Le trigger fait foi (source de vérité) ; le code
-- applicatif (onboarding) complète ensuite first_name/sex/... via upsert.
--
-- Note : profiles.first_name est NOT NULL sans valeur par défaut → on insère
-- une chaîne vide '' comme placeholder. Cela satisfait la contrainte ET garde
-- la sémantique « profil incomplet » : l'app route les first_name vides vers
-- l'onboarding (profile?.first_name ? '/dashboard' : '/onboarding').

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer            -- s'exécute en tant que propriétaire (postgres) → bypass RLS
set search_path = public
as $$
begin
  insert into public.profiles (
    user_id,
    first_name,
    status,
    is_admin,
    current_mode,
    cgv_accepted_at
  )
  values (
    new.id,
    '',                      -- placeholder : complété à l'onboarding
    'pending',
    false,
    'demo',
    coalesce((new.raw_user_meta_data ->> 'cgv_accepted_at')::timestamptz, now())
  )
  on conflict (user_id) do nothing;   -- idempotent : n'échoue pas si la ligne existe déjà
  return new;
end;
$$;

-- Trigger : à chaque nouvel utilisateur, créer automatiquement son profil.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================
-- RATTRAPAGE DES COMPTES ORPHELINS EXISTANTS
-- =========================================
-- Crée la ligne `profiles` manquante pour tout utilisateur auth.users déjà
-- présent mais sans profil (avant l'installation du trigger).
-- first_name = '' (NOT NULL) ; statut 'pending' → prêt à approuver.
insert into public.profiles (user_id, first_name, status, is_admin, current_mode)
select u.id, '', 'pending', false, 'demo'
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null
on conflict (user_id) do nothing;
