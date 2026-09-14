create extension if not exists pgcrypto;

-- HOLO credits are tracked as integer video seconds/units, not provider USD balance.
alter table public.wallets
  add column if not exists balance_seconds bigint not null default 0 check (balance_seconds >= 0);

create table if not exists public.holo_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_seconds bigint not null,
  kind text not null check (kind in ('grant','charge','refund','adjustment')),
  reference_type text,
  reference_id text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_holo_credit_reference
  on public.holo_credit_transactions(user_id, reference_type, reference_id, kind)
  where reference_type is not null and reference_id is not null;
create index if not exists idx_holo_credit_user_created
  on public.holo_credit_transactions(user_id, created_at desc);

-- Persistent, unpredictable Toss customerKey per member. Keep server-only.
create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  toss_customer_key text not null unique,
  billing_key text,
  billing_method text,
  billing_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null unique,
  payment_key text unique,
  plan_id text not null,
  order_name text not null,
  amount_krw bigint not null check (amount_krw > 0),
  credit_seconds bigint not null check (credit_seconds > 0),
  currency text not null default 'KRW',
  status text not null default 'READY',
  method text,
  approved_at timestamptz,
  canceled_at timestamptz,
  failure_code text,
  failure_message text,
  toss_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payments_user_created on public.payments(user_id, created_at desc);
create index if not exists idx_payments_status on public.payments(status, created_at desc);

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  order_id text not null,
  reason text not null,
  requested_amount_krw bigint,
  status text not null default 'REQUESTED' check (status in ('REQUESTED','REVIEWING','APPROVED','REJECTED','COMPLETED')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_refund_requests_user_created on public.refund_requests(user_id, created_at desc);

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  transmission_id text not null unique,
  event_type text,
  order_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_payment_webhooks_order on public.payment_webhook_events(order_id, created_at desc);

-- Future recurring billing state. Actual billing-key issuance/charging is enabled only after Toss contract + product decision.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  status text not null default 'INACTIVE' check (status in ('INACTIVE','ACTIVE','PAST_DUE','CANCELED')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_charge_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_subscription_user_active
  on public.subscriptions(user_id)
  where status in ('ACTIVE','PAST_DUE');

alter table public.holo_credit_transactions enable row level security;
alter table public.payments enable row level security;
alter table public.refund_requests enable row level security;
alter table public.billing_customers enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists holo_credits_select_self on public.holo_credit_transactions;
create policy holo_credits_select_self on public.holo_credit_transactions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists payments_select_self on public.payments;
create policy payments_select_self on public.payments
  for select to authenticated using (user_id = auth.uid());

drop policy if exists refund_requests_select_self on public.refund_requests;
create policy refund_requests_select_self on public.refund_requests
  for select to authenticated using (user_id = auth.uid());

drop policy if exists subscriptions_select_self on public.subscriptions;
create policy subscriptions_select_self on public.subscriptions
  for select to authenticated using (user_id = auth.uid());

-- billing_customers and webhook events intentionally have no authenticated-user policy.
-- They are server-only because billing keys and raw webhook payloads should not be exposed to the browser.

grant all on public.holo_credit_transactions to service_role;
grant all on public.payments to service_role;
grant all on public.refund_requests to service_role;
grant all on public.billing_customers to service_role;
grant all on public.payment_webhook_events to service_role;
grant all on public.subscriptions to service_role;
