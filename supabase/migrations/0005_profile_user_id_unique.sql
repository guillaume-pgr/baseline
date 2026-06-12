-- =========================================
-- UNICITÉ DE profiles.user_id (lecture déterministe du statut)
-- =========================================
-- Le gating lit le profil via .single() sur user_id. S'il existait deux lignes
-- profiles pour un même user_id, .single() échouerait → profil null → l'app
-- retomberait sur le statut par défaut 'pending' (faux « compte en attente »).
--
-- La contrainte unique(user_id) existe déjà depuis 0001_initial. Cette migration
-- est une ceinture de sécurité IDEMPOTENTE : elle dé-doublonne d'éventuelles
-- lignes en trop puis garantit la présence de la contrainte. Sur une base saine,
-- c'est un no-op.

-- 1) Dé-doublonnage défensif : ne garder qu'UNE ligne par user_id.
--    Priorité de la ligne conservée : compte approuvé d'abord, puis profil
--    renseigné (first_name non vide), puis la plus ancienne.
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
  from public.profiles
)
delete from public.profiles p
using ranked r
where p.id = r.id
  and r.rn > 1;

-- 2) Garantir la contrainte unique sur user_id (uniquement si absente).
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum = any (c.conkey)
    where c.conrelid = 'public.profiles'::regclass
      and c.contype = 'u'
      and a.attname = 'user_id'
      and array_length(c.conkey, 1) = 1
  ) then
    alter table public.profiles
      add constraint profiles_user_id_key unique (user_id);
  end if;
end $$;
