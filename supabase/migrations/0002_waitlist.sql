create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now(),
  source text default 'demo_real_mode'
);

alter table waitlist enable row level security;

create policy "Anyone can insert waitlist" on waitlist
  for insert with check (true);
