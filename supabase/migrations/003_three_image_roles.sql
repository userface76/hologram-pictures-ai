-- HOLOGRAM PICTURES AI
-- Three-role image inputs: start frame / reference image / end frame

alter table public.projects
  add column if not exists first_frame_url text,
  add column if not exists reference_image_url text,
  add column if not exists last_frame_url text;

alter table public.assets
  add column if not exists role text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assets_role_check'
      and conrelid = 'public.assets'::regclass
  ) then
    alter table public.assets
      add constraint assets_role_check
      check (role is null or role in ('first_frame','reference_image','last_frame'));
  end if;
end $$;

create index if not exists assets_user_role_idx
  on public.assets(user_id, role, created_at desc);

comment on column public.projects.first_frame_url is 'Public or signed URL for the intended opening frame';
comment on column public.projects.reference_image_url is 'Reference image used by HOLO prompt intelligence or MiniMax reference-to-video mode';
comment on column public.projects.last_frame_url is 'Public or signed URL for the intended ending frame';
comment on column public.assets.role is 'HOLO media role: first_frame, reference_image, or last_frame';
