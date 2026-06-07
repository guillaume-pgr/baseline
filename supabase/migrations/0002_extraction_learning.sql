-- =========================================
-- BOUCLE D'APPRENTISSAGE DE L'EXTRACTION (sous-étape F)
-- =========================================
-- Logue chaque import et les corrections faites par l'utilisateur dans l'écran
-- de validation, pour enrichir le référentiel (alias / unités) dans le temps.

create table extraction_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  lab_name text,
  markers_count int not null default 0,
  low_confidence_count int not null default 0,
  unmatched_markers jsonb,
  global_confidence numeric,
  model text
);

create table extraction_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  raw_name text not null,
  corrected_canonical text,
  raw_unit text,
  corrected_unit text,
  lab_name text
);

-- RLS : chaque utilisateur ne voit/écrit que ses propres lignes.
-- (L'analyse admin se fait via le SQL editor / service role, qui contourne RLS.)
alter table extraction_logs enable row level security;
alter table extraction_corrections enable row level security;

create policy "Users see own extraction logs" on extraction_logs
  for all using (auth.uid() = user_id);

create policy "Users see own extraction corrections" on extraction_corrections
  for all using (auth.uid() = user_id);

create index idx_extraction_logs_user on extraction_logs (user_id, created_at desc);
create index idx_extraction_corrections_raw_name on extraction_corrections (raw_name);
