create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  title text not null,
  status text not null default 'active',
  selected_model text,
  user_request text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.render_jobs (
  id uuid primary key,
  project_id uuid references public.projects(id) on delete set null,
  provider text not null,
  model text not null,
  provider_task_id text,
  status text not null check (status in ('queued','processing','completed','failed')),
  progress integer not null default 0 check (progress between 0 and 100),
  prompt text not null,
  error text,
  source_url text,
  storage_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  render_job_id uuid not null unique references public.render_jobs(id) on delete cascade,
  provider text not null,
  model text not null,
  prompt text not null,
  duration integer,
  aspect_ratio text,
  resolution text,
  audio boolean,
  source_url text,
  storage_url text not null,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_created_at on public.projects(created_at desc);
create index if not exists idx_render_jobs_project_id on public.render_jobs(project_id);
create index if not exists idx_render_jobs_created_at on public.render_jobs(created_at desc);
create index if not exists idx_videos_project_id on public.videos(project_id);
create index if not exists idx_videos_created_at on public.videos(created_at desc);

alter table public.projects enable row level security;
alter table public.render_jobs enable row level security;
alter table public.videos enable row level security;

-- V0.3: the public web client does not talk directly to these tables.
-- The Railway API uses SUPABASE_SERVICE_ROLE_KEY server-side.
-- Add authenticated-user RLS policies when login is introduced.

grant all on public.projects to service_role;
grant all on public.render_jobs to service_role;
grant all on public.videos to service_role;
