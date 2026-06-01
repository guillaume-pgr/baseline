-- =========================================
-- PROFILS UTILISATEURS
-- =========================================
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  first_name text not null,
  last_name text,
  birth_date date,
  sex text check (sex in ('M','F')),
  height_cm int,
  current_mode text default 'demo' check (current_mode in ('demo','real')),
  current_demo_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- =========================================
-- BILANS SANGUINS
-- =========================================
create table blood_panels (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  panel_date date not null,
  lab_name text,
  source_pdf_url text,
  raw_extraction jsonb,
  validated_at timestamptz,
  created_at timestamptz default now()
);

create table blood_markers (
  id uuid primary key default gen_random_uuid(),
  panel_id uuid references blood_panels(id) on delete cascade not null,
  marker_code text not null,
  marker_name text not null,
  value numeric not null,
  unit text not null,
  ref_min numeric,
  ref_max numeric,
  organ_system text,
  status text check (status in ('optimal','warning','danger','low_normal','high_normal')),
  created_at timestamptz default now()
);

-- =========================================
-- COMPOSITION CORPORELLE
-- =========================================
create table body_measurements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  measured_at timestamptz not null,
  source text not null,
  weight_kg numeric,
  body_fat_pct numeric,
  muscle_mass_kg numeric,
  muscle_mass_pct numeric,
  bone_mass_kg numeric,
  water_pct numeric,
  visceral_fat int,
  bmr_kcal int,
  created_at timestamptz default now()
);

-- =========================================
-- VO2MAX
-- =========================================
create table vo2max_readings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  measured_at timestamptz not null,
  source text not null,
  vo2max_value numeric not null,
  fitness_age int,
  created_at timestamptz default now()
);

-- =========================================
-- SOMMEIL + HRV
-- =========================================
create table sleep_readings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  measured_at timestamptz not null,
  source text not null,
  total_minutes int,
  deep_minutes int,
  rem_minutes int,
  light_minutes int,
  awake_minutes int,
  hrv_rmssd numeric,
  resting_hr int,
  efficiency_pct numeric,
  created_at timestamptz default now()
);

-- =========================================
-- MICROBIOTE
-- =========================================
create table microbiome_tests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  test_date date not null,
  source text not null,
  shannon_diversity numeric,
  firmicutes_pct numeric,
  bacteroidetes_pct numeric,
  fb_ratio numeric,
  raw_data jsonb,
  created_at timestamptz default now()
);

-- =========================================
-- CONNEXIONS APPAREILS (Phase 7)
-- =========================================
create table health_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  provider text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  provider_user_id text,
  scopes text[],
  last_sync_at timestamptz,
  status text default 'active' check (status in ('active','expired','revoked','error')),
  created_at timestamptz default now(),
  unique(profile_id, provider)
);

-- =========================================
-- CHAT IA (Phase 8)
-- =========================================
create table chat_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  context_page text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references chat_conversations(id) on delete cascade not null,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);

-- =========================================
-- RLS (Row Level Security)
-- =========================================
alter table profiles enable row level security;
alter table blood_panels enable row level security;
alter table blood_markers enable row level security;
alter table body_measurements enable row level security;
alter table vo2max_readings enable row level security;
alter table sleep_readings enable row level security;
alter table microbiome_tests enable row level security;
alter table health_connections enable row level security;
alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- Policies : user voit uniquement ses propres données
create policy "Users see own profile" on profiles
  for all using (auth.uid() = user_id);

create policy "Users see own panels" on blood_panels for all using (
  exists (select 1 from profiles
    where profiles.id = blood_panels.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own markers" on blood_markers for all using (
  exists (select 1 from blood_panels
    join profiles on profiles.id = blood_panels.profile_id
    where blood_panels.id = blood_markers.panel_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own body measurements" on body_measurements for all using (
  exists (select 1 from profiles
    where profiles.id = body_measurements.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own vo2max" on vo2max_readings for all using (
  exists (select 1 from profiles
    where profiles.id = vo2max_readings.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own sleep" on sleep_readings for all using (
  exists (select 1 from profiles
    where profiles.id = sleep_readings.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own microbiome" on microbiome_tests for all using (
  exists (select 1 from profiles
    where profiles.id = microbiome_tests.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own connections" on health_connections for all using (
  exists (select 1 from profiles
    where profiles.id = health_connections.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own conversations" on chat_conversations for all using (
  exists (select 1 from profiles
    where profiles.id = chat_conversations.profile_id
    and profiles.user_id = auth.uid())
);

create policy "Users see own messages" on chat_messages for all using (
  exists (select 1 from chat_conversations
    join profiles on profiles.id = chat_conversations.profile_id
    where chat_conversations.id = chat_messages.conversation_id
    and profiles.user_id = auth.uid())
);

-- =========================================
-- INDEX
-- =========================================
create index idx_blood_markers_panel on blood_markers (panel_id, marker_code);
create index idx_body_measurements_profile on body_measurements (profile_id, measured_at desc);
create index idx_vo2max_profile on vo2max_readings (profile_id, measured_at desc);
create index idx_sleep_profile on sleep_readings (profile_id, measured_at desc);
create index idx_microbiome_profile on microbiome_tests (profile_id, test_date desc);
create index idx_connections_profile on health_connections (profile_id, provider);

-- =========================================
-- TRIGGER auto-update updated_at
-- =========================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();
