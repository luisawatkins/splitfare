-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cid_anchors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  root_cid text NOT NULL,
  car_cid text,
  anchor_tx_hash text,
  chain text,
  record_count integer,
  anchored_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT cid_anchors_pkey PRIMARY KEY (id),
  CONSTRAINT cid_anchors_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.expense_splits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL,
  user_id text NOT NULL,
  amount_owed numeric NOT NULL,
  percentage_owed numeric,
  shares integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expense_splits_pkey PRIMARY KEY (id),
  CONSTRAINT expense_splits_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id),
  CONSTRAINT expense_splits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  created_by text NOT NULL,
  description text NOT NULL,
  total_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC'::text,
  category USER-DEFINED,
  split_type USER-DEFINED NOT NULL DEFAULT 'equal'::split_type,
  external_tx_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'member'::role,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  currency text NOT NULL DEFAULT 'USDC'::text,
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  category USER-DEFINED NOT NULL DEFAULT 'other'::group_category,
  space_did text UNIQUE,
  avatar_url text,
  invite_code text NOT NULL UNIQUE,
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  payer_id text NOT NULL,
  payee_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USDC'::text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::settlement_status,
  tx_hash text,
  chain text,
  manifest_cid text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT settlements_pkey PRIMARY KEY (id),
  CONSTRAINT settlements_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT settlements_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.users(id),
  CONSTRAINT settlements_payee_id_fkey FOREIGN KEY (payee_id) REFERENCES public.users(id)
);
CREATE TABLE public.shared_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  expense_id uuid,
  uploader_id text NOT NULL,
  cid text NOT NULL,
  media_type text NOT NULL,
  title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shared_media_pkey PRIMARY KEY (id),
  CONSTRAINT shared_media_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT shared_media_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id),
  CONSTRAINT shared_media_uploader_id_fkey FOREIGN KEY (uploader_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  type text NOT NULL, -- 'expense_added', 'settlement_sent', 'settlement_received', 'payment_reminder', 'group_invite', 'member_joined'
  title text NOT NULL,
  message text NOT NULL,
  data jsonb, -- For storing relevant IDs like group_id, expense_id, etc.
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.export_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid, -- NULL for "all groups" export
  user_id text NOT NULL,
  format text NOT NULL, -- 'car', 'json', 'csv', 'pdf'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  root_cid text, -- For CAR/JSON exports if applicable
  file_url text, -- If stored somewhere else
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT export_history_pkey PRIMARY KEY (id),
  CONSTRAINT export_history_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id),
  CONSTRAINT export_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

CREATE TABLE public.users (
  id text NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  username text NOT NULL UNIQUE,
  ens_name text UNIQUE,
  wallet_address text UNIQUE,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);