-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- =========================
-- ENUMS
-- =========================

create type role as enum ('owner', 'member');

create type split_type as enum ('equal', 'percentage', 'shares', 'custom');

create type settlement_status as enum ('pending', 'completed', 'failed');

create type expense_category as enum (
  'travel',
  'food',
  'accommodation',
  'transport',
  'subscription',
  'other'
);

-- =========================
-- USERS (already have, included here for reference)
-- =========================
-- If you already created this table, skip this block.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  username text unique not null,
  ens_name text unique,
  wallet_address text unique,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful index if you frequently look users up by ENS
create index if not exists users_ens_name_idx on public.users (ens_name);

-- =========================
-- GROUPS
-- =========================

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  currency text not null default 'USDC',
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists groups_created_by_idx on public.groups (created_by);

-- =========================
-- GROUP MEMBERS
-- =========================

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role role not null default 'member',
  joined_at timestamptz not null default now()
);

-- A user can only appear once per group
create unique index if not exists group_members_group_user_unique
  on public.group_members (group_id, user_id);

create index if not exists group_members_user_idx on public.group_members (user_id);

-- =========================
-- EXPENSES
-- =========================

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete restrict,
  description text not null,
  total_amount numeric(18,6) not null,
  currency text not null default 'USDC',
  category expense_category,
  split_type split_type not null default 'equal',
  external_tx_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_group_id_idx on public.expenses (group_id);
create index if not exists expenses_created_by_idx on public.expenses (created_by);
create index if not exists expenses_category_idx on public.expenses (category);

-- =========================
-- EXPENSE SPLITS
-- =========================

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

  -- For 'equal' splits, amount_owed is computed but stored.
  -- For 'percentage', percentage_owed is set and amount_owed can be derived.
  -- For 'shares', shares is set; app can compute based on total_amount.
  amount_owed numeric(18,6) not null,
  percentage_owed numeric(5,2),
  shares integer,
  created_at timestamptz not null default now()
);

create index if not exists expense_splits_expense_idx on public.expense_splits (expense_id);
create index if not exists expense_splits_user_idx on public.expense_splits (user_id);

-- =========================
-- SETTLEMENTS
-- =========================

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  payer_id uuid not null references public.users(id) on delete restrict,
  payee_id uuid not null references public.users(id) on delete restrict,
  amount numeric(18,6) not null,
  currency text not null default 'USDC',
  status settlement_status not null default 'pending',
  tx_hash text,
  chain text, -- e.g. "base", "optimism", etc.
  manifest_cid text, -- Storacha settlement manifest CID
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists settlements_group_idx on public.settlements (group_id);
create index if not exists settlements_payer_idx on public.settlements (payer_id);
create index if not exists settlements_payee_idx on public.settlements (payee_id);
create index if not exists settlements_status_idx on public.settlements (status);

-- =========================
-- CID ANCHORS (group history CAR roots)
-- =========================

create table if not exists public.cid_anchors (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  root_cid text not null,
  car_cid text,
  anchor_tx_hash text,
  anchored_at timestamptz not null default now()
);

create index if not exists cid_anchors_group_idx on public.cid_anchors (group_id);

-- =========================
-- SHARED MEDIA
-- =========================

create table if not exists public.shared_media (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete set null,
  uploader_id uuid not null references public.users(id) on delete restrict,
  cid text not null,            -- Storacha CID
  media_type text not null,     -- 'image', 'pdf', etc.
  title text,
  created_at timestamptz not null default now()
);

create index if not exists shared_media_group_idx on public.shared_media (group_id);
create index if not exists shared_media_expense_idx on public.shared_media (expense_id);
create index if not exists shared_media_uploader_idx on public.shared_media (uploader_id);