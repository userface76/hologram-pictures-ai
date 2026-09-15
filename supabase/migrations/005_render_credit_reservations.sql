create extension if not exists pgcrypto;

alter table public.wallets
  add column if not exists reserved_seconds bigint not null default 0 check (reserved_seconds >= 0);

create table if not exists public.holo_credit_reservations (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  render_job_id text unique,
  amount_seconds bigint not null check (amount_seconds > 0),
  status text not null default 'RESERVED' check (status in ('RESERVED','SETTLED','RELEASED')),
  model text,
  resolution text,
  duration_seconds integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settled_at timestamptz,
  released_at timestamptz
);

create index if not exists idx_holo_credit_reservations_user_created
  on public.holo_credit_reservations(user_id, created_at desc);
create index if not exists idx_holo_credit_reservations_status
  on public.holo_credit_reservations(status, created_at desc);

alter table public.holo_credit_reservations enable row level security;
drop policy if exists holo_credit_reservations_select_self on public.holo_credit_reservations;
create policy holo_credit_reservations_select_self on public.holo_credit_reservations
  for select to authenticated using (user_id = auth.uid());

grant all on public.holo_credit_reservations to service_role;

create or replace function public.reserve_holo_credits(
  p_user_id uuid,
  p_reservation_id uuid,
  p_amount_seconds bigint,
  p_model text default null,
  p_resolution text default null,
  p_duration_seconds integer default null,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance bigint;
  v_reserved bigint;
begin
  if p_amount_seconds <= 0 then
    raise exception 'invalid_credit_amount';
  end if;

  insert into public.wallets(user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select balance_seconds, reserved_seconds
    into v_balance, v_reserved
  from public.wallets
  where user_id = p_user_id
  for update;

  if coalesce(v_balance, 0) < p_amount_seconds then
    return jsonb_build_object(
      'ok', false,
      'reason', 'insufficient_credits',
      'balance_seconds', coalesce(v_balance, 0),
      'reserved_seconds', coalesce(v_reserved, 0),
      'required_seconds', p_amount_seconds
    );
  end if;

  update public.wallets
  set balance_seconds = balance_seconds - p_amount_seconds,
      reserved_seconds = reserved_seconds + p_amount_seconds,
      updated_at = now()
  where user_id = p_user_id
  returning balance_seconds, reserved_seconds into v_balance, v_reserved;

  insert into public.holo_credit_reservations(
    id, user_id, amount_seconds, status, model, resolution, duration_seconds, metadata
  ) values (
    p_reservation_id, p_user_id, p_amount_seconds, 'RESERVED', p_model, p_resolution, p_duration_seconds, coalesce(p_metadata, '{}'::jsonb)
  );

  return jsonb_build_object(
    'ok', true,
    'reservation_id', p_reservation_id,
    'balance_seconds', v_balance,
    'reserved_seconds', v_reserved,
    'required_seconds', p_amount_seconds
  );
end;
$$;

create or replace function public.link_holo_credit_reservation_job(
  p_user_id uuid,
  p_reservation_id uuid,
  p_render_job_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.holo_credit_reservations
  set render_job_id = p_render_job_id,
      updated_at = now()
  where id = p_reservation_id
    and user_id = p_user_id
    and status = 'RESERVED';

  return jsonb_build_object('ok', found, 'reservation_id', p_reservation_id, 'render_job_id', p_render_job_id);
end;
$$;

create or replace function public.settle_holo_credits_for_job(
  p_user_id uuid,
  p_render_job_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res public.holo_credit_reservations%rowtype;
  v_balance bigint;
  v_reserved bigint;
begin
  select * into v_res
  from public.holo_credit_reservations
  where user_id = p_user_id and render_job_id = p_render_job_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_found');
  end if;

  if v_res.status = 'SETTLED' then
    return jsonb_build_object('ok', true, 'already_settled', true, 'amount_seconds', v_res.amount_seconds);
  end if;

  if v_res.status <> 'RESERVED' then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_reserved', 'status', v_res.status);
  end if;

  update public.wallets
  set reserved_seconds = greatest(0, reserved_seconds - v_res.amount_seconds),
      updated_at = now()
  where user_id = p_user_id
  returning balance_seconds, reserved_seconds into v_balance, v_reserved;

  update public.holo_credit_reservations
  set status = 'SETTLED', settled_at = now(), updated_at = now()
  where id = v_res.id;

  insert into public.holo_credit_transactions(
    user_id, amount_seconds, kind, reference_type, reference_id, note, metadata
  ) values (
    p_user_id, -v_res.amount_seconds, 'charge', 'render_reservation', v_res.id::text,
    'render completed credit charge',
    jsonb_build_object('render_job_id', p_render_job_id, 'model', v_res.model, 'resolution', v_res.resolution, 'duration_seconds', v_res.duration_seconds)
  ) on conflict do nothing;

  return jsonb_build_object(
    'ok', true,
    'status', 'SETTLED',
    'amount_seconds', v_res.amount_seconds,
    'balance_seconds', v_balance,
    'reserved_seconds', v_reserved
  );
end;
$$;

create or replace function public.release_holo_credits_for_job(
  p_user_id uuid,
  p_render_job_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res public.holo_credit_reservations%rowtype;
  v_balance bigint;
  v_reserved bigint;
begin
  select * into v_res
  from public.holo_credit_reservations
  where user_id = p_user_id and render_job_id = p_render_job_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_found');
  end if;

  if v_res.status = 'RELEASED' then
    return jsonb_build_object('ok', true, 'already_released', true, 'amount_seconds', v_res.amount_seconds);
  end if;

  if v_res.status <> 'RESERVED' then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_reserved', 'status', v_res.status);
  end if;

  update public.wallets
  set balance_seconds = balance_seconds + v_res.amount_seconds,
      reserved_seconds = greatest(0, reserved_seconds - v_res.amount_seconds),
      updated_at = now()
  where user_id = p_user_id
  returning balance_seconds, reserved_seconds into v_balance, v_reserved;

  update public.holo_credit_reservations
  set status = 'RELEASED', released_at = now(), updated_at = now()
  where id = v_res.id;

  insert into public.holo_credit_transactions(
    user_id, amount_seconds, kind, reference_type, reference_id, note, metadata
  ) values (
    p_user_id, v_res.amount_seconds, 'refund', 'render_reservation', v_res.id::text,
    'render failed credit release',
    jsonb_build_object('render_job_id', p_render_job_id, 'model', v_res.model, 'resolution', v_res.resolution, 'duration_seconds', v_res.duration_seconds)
  ) on conflict do nothing;

  return jsonb_build_object(
    'ok', true,
    'status', 'RELEASED',
    'amount_seconds', v_res.amount_seconds,
    'balance_seconds', v_balance,
    'reserved_seconds', v_reserved
  );
end;
$$;

create or replace function public.release_holo_credit_reservation(
  p_user_id uuid,
  p_reservation_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_res public.holo_credit_reservations%rowtype;
  v_balance bigint;
  v_reserved bigint;
begin
  select * into v_res
  from public.holo_credit_reservations
  where user_id = p_user_id and id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_found');
  end if;

  if v_res.status = 'RELEASED' then
    return jsonb_build_object('ok', true, 'already_released', true, 'amount_seconds', v_res.amount_seconds);
  end if;

  if v_res.status <> 'RESERVED' then
    return jsonb_build_object('ok', false, 'reason', 'reservation_not_reserved', 'status', v_res.status);
  end if;

  update public.wallets
  set balance_seconds = balance_seconds + v_res.amount_seconds,
      reserved_seconds = greatest(0, reserved_seconds - v_res.amount_seconds),
      updated_at = now()
  where user_id = p_user_id
  returning balance_seconds, reserved_seconds into v_balance, v_reserved;

  update public.holo_credit_reservations
  set status = 'RELEASED', released_at = now(), updated_at = now()
  where id = v_res.id;

  insert into public.holo_credit_transactions(
    user_id, amount_seconds, kind, reference_type, reference_id, note, metadata
  ) values (
    p_user_id, v_res.amount_seconds, 'refund', 'render_reservation', v_res.id::text,
    'render create failed credit release', v_res.metadata
  ) on conflict do nothing;

  return jsonb_build_object(
    'ok', true,
    'status', 'RELEASED',
    'amount_seconds', v_res.amount_seconds,
    'balance_seconds', v_balance,
    'reserved_seconds', v_reserved
  );
end;
$$;

revoke all on function public.reserve_holo_credits(uuid,uuid,bigint,text,text,integer,jsonb) from public, authenticated;
revoke all on function public.link_holo_credit_reservation_job(uuid,uuid,text) from public, authenticated;
revoke all on function public.settle_holo_credits_for_job(uuid,text) from public, authenticated;
revoke all on function public.release_holo_credits_for_job(uuid,text) from public, authenticated;
revoke all on function public.release_holo_credit_reservation(uuid,uuid) from public, authenticated;

grant execute on function public.reserve_holo_credits(uuid,uuid,bigint,text,text,integer,jsonb) to service_role;
grant execute on function public.link_holo_credit_reservation_job(uuid,uuid,text) to service_role;
grant execute on function public.settle_holo_credits_for_job(uuid,text) to service_role;
grant execute on function public.release_holo_credits_for_job(uuid,text) to service_role;
grant execute on function public.release_holo_credit_reservation(uuid,uuid) to service_role;
