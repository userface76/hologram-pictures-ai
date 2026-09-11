create extension if not exists pgcrypto;

-- Account profile. Keep auth identity in auth.users and application metadata here.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Internal HOLO credits. This is separate from the provider's MiniMax account balance.
create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_usd numeric(12,4) not null default 0 check (balance_usd >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(12,4) not null,
  kind text not null check (kind in ('grant','charge','refund','adjustment')),
  reference_type text,
  reference_id uuid,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tenant ownership for all generated content.
alter table public.projects add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.render_jobs add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.videos add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  object_key text not null unique,
  public_url text,
  original_name text,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_user_created on public.projects(user_id, created_at desc);
create index if not exists idx_render_jobs_user_created on public.render_jobs(user_id, created_at desc);
create index if not exists idx_videos_user_created on public.videos(user_id, created_at desc);
create index if not exists idx_assets_user_created on public.assets(user_id, created_at desc);
create index if not exists idx_credit_transactions_user_created on public.credit_transactions(user_id, created_at desc);

-- Provision application rows whenever a Supabase Auth user is created.
create or replace function public.handle_new_holo_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do update set email = excluded.email, updated_at = now();

  insert into public.wallets(user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_holo on auth.users;
create trigger on_auth_user_created_holo
after insert or update of email on auth.users
for each row execute procedure public.handle_new_holo_user();

-- Backfill accounts for users that existed before this migration.
insert into public.profiles(user_id, email)
select id, email from auth.users
on conflict (user_id) do update set email = excluded.email, updated_at = now();

insert into public.wallets(user_id)
select id from auth.users
on conflict (user_id) do nothing;

alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.assets enable row level security;

-- Existing content tables already have RLS enabled in migration 001, but repeat safely.
alter table public.projects enable row level security;
alter table public.render_jobs enable row level security;
alter table public.videos enable row level security;

-- Direct Supabase client access, if enabled later, remains tenant-scoped.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated using (user_id = auth.uid());

drop policy if exists wallets_select_self on public.wallets;
create policy wallets_select_self on public.wallets for select to authenticated using (user_id = auth.uid());

drop policy if exists credits_select_self on public.credit_transactions;
create policy credits_select_self on public.credit_transactions for select to authenticated using (user_id = auth.uid());

drop policy if exists assets_select_self on public.assets;
create policy assets_select_self on public.assets for select to authenticated using (user_id = auth.uid());

drop policy if exists projects_select_self on public.projects;
create policy projects_select_self on public.projects for select to authenticated using (user_id = auth.uid());

drop policy if exists render_jobs_select_self on public.render_jobs;
create policy render_jobs_select_self on public.render_jobs for select to authenticated using (user_id = auth.uid());

drop policy if exists videos_select_self on public.videos;
create policy videos_select_self on public.videos for select to authenticated using (user_id = auth.uid());

-- The Railway API uses the server-side secret/service role and can perform controlled writes.
grant all on public.profiles to service_role;
grant all on public.wallets to service_role;
grant all on public.credit_transactions to service_role;
grant all on public.assets to service_role;
grant all on public.projects to service_role;
grant all on public.render_jobs to service_role;
grant all on public.videos to service_role;
