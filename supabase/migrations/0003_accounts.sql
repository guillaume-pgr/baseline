-- Extend profiles table with account status & admin flag
alter table profiles
  add column if not exists status text
    default 'pending'
    check (status in ('pending','approved_free','approved_premium','rejected'));

alter table profiles
  add column if not exists is_admin boolean default false;

alter table profiles
  add column if not exists cgv_accepted_at timestamptz;

alter table profiles
  add column if not exists approved_at timestamptz;

alter table profiles
  add column if not exists last_chat_question_at timestamptz;

-- Index for fast admin lookups
create index if not exists profiles_status_idx on profiles (status);

-- RLS: users can read their own profile (already exists),
-- allow them to also read the status field
-- (no extra policy needed — existing select policy covers all columns)
