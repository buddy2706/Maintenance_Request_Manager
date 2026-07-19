-- Maintenance Friction — schema, RLS, and guard triggers.
-- Run this once in the Supabase SQL Editor on a fresh project.

-- ============================================================
-- 1. Tables
-- ============================================================

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('guest','resident','manager','vendor','admin')),
  display_name text not null default '',
  email        text not null default '',
  created_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.work_orders (
  id                uuid primary key default gen_random_uuid(),
  seq               bigint generated always as identity,
  category          text not null,
  symptom           text not null,
  priority          text not null default 'standard' check (priority in ('standard','emergency')),
  state             text not null default 'submitted'
                       check (state in ('submitted','triaged','offered','scheduling',
                                         'in_progress','on_hold','resolved')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  resolved_at       timestamptz,
  manager_touches   integer not null default 0,
  clarify_requested boolean not null default false,
  repeat            boolean not null default false,
  reassign_count    integer not null default 0,
  resident_id       uuid not null references auth.users(id),
  vendor_id         uuid references auth.users(id),
  scheduled_for     text,
  on_hold_reason    text
);
alter table public.work_orders enable row level security;
create index on public.work_orders (resident_id);
create index on public.work_orders (vendor_id);

create table public.work_order_history (
  id            bigint generated always as identity primary key,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  occurred_at   timestamptz not null default now(),
  actor         text not null check (actor in ('guest','resident','manager','vendor','admin')),
  action        text not null,
  label         text not null
);
alter table public.work_order_history enable row level security;
create index on public.work_order_history (work_order_id);

-- Base table privileges: RLS only filters *rows* a role can already touch — the
-- role still needs a plain GRANT first. Tables created via the Table Editor get
-- this automatically; tables created via raw SQL (like this file) don't.
grant usage on schema public to authenticated, anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.work_orders to authenticated;
grant select, insert on public.work_order_history to authenticated;

-- ============================================================
-- 2. Helper functions (SECURITY DEFINER — avoid RLS self-recursion)
-- ============================================================

create or replace function public.current_role_name()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role_name() = 'admin';
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role_name() in ('manager', 'admin');
$$;

create or replace function public.can_view_all()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.current_role_name() in ('manager', 'admin', 'guest');
$$;

-- ============================================================
-- 3. Signup trigger — creates the matching profiles row
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text;
begin
  if new.is_anonymous then
    chosen_role := 'guest';
  else
    chosen_role := coalesce(new.raw_user_meta_data->>'role', 'resident');
    if chosen_role not in ('resident', 'manager', 'vendor') then
      chosen_role := 'resident'; -- clamp: email/password signup can never grant admin/guest this way
    end if;
  end if;

  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    chosen_role,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 4. profiles RLS
-- ============================================================

create policy "profiles_select"
on public.profiles for select
using (id = auth.uid() or public.can_view_all());

create policy "profiles_update"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (true);

create or replace function public.profiles_column_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text := public.current_role_name();
  allowed text[];
begin
  if auth.uid() is null then
    return new; -- service-role / SQL Editor context — RLS already bypassed to reach here
  end if;

  if caller_role = 'admin' then
    return new; -- admin may change role/display_name on any row
  end if;

  if auth.uid() = old.id then
    allowed := array['display_name'];
  else
    raise exception 'not permitted to modify another user''s profile';
  end if;

  if (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
    raise exception 'role % not permitted to modify these columns', caller_role;
  end if;
  return new;
end;
$$;

create trigger profiles_column_guard
  before update on public.profiles
  for each row execute procedure public.profiles_column_guard();

-- ============================================================
-- 5. work_orders RLS
-- ============================================================

create policy "wo_select"
on public.work_orders for select
using (resident_id = auth.uid() or vendor_id = auth.uid() or public.can_view_all());

create policy "wo_insert_resident"
on public.work_orders for insert
with check (resident_id = auth.uid() and state = 'submitted' and vendor_id is null);

create policy "wo_update"
on public.work_orders for update
using (resident_id = auth.uid() or vendor_id = auth.uid() or public.is_staff())
with check (true); -- ownership can legitimately change (e.g. vendor decline clears vendor_id);
                    -- column-level restriction happens in the guard trigger below.

create or replace function public.work_orders_column_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text := public.current_role_name();
  allowed text[];
begin
  if auth.uid() is null then
    return new; -- service-role / SQL Editor context — RLS already bypassed to reach here
  end if;

  if caller_role in ('manager', 'admin') then
    return new; -- staff may touch any column
  elsif caller_role = 'resident' then
    allowed := array['state', 'repeat', 'resolved_at', 'manager_touches', 'updated_at'];
    if new.state is distinct from old.state
       and not (old.state = 'resolved' and new.state = 'triaged') then
      raise exception 'residents may only reopen a resolved order';
    end if;
  elsif caller_role = 'vendor' then
    allowed := array['state', 'vendor_id', 'scheduled_for', 'on_hold_reason',
                      'resolved_at', 'reassign_count', 'updated_at'];
    if new.vendor_id is distinct from old.vendor_id and new.vendor_id is not null then
      raise exception 'vendors may only clear their own assignment, not reassign';
    end if;
  else
    raise exception 'role % is not permitted to update work orders', caller_role;
  end if;

  if (to_jsonb(new) - allowed) is distinct from (to_jsonb(old) - allowed) then
    raise exception 'role % not permitted to modify these columns', caller_role;
  end if;
  return new;
end;
$$;

create trigger work_orders_column_guard
  before update on public.work_orders
  for each row execute procedure public.work_orders_column_guard();

-- ============================================================
-- 6. work_order_history RLS
-- ============================================================

create policy "history_select"
on public.work_order_history for select
using (exists (
  select 1 from public.work_orders wo
  where wo.id = work_order_history.work_order_id
    and (wo.resident_id = auth.uid() or wo.vendor_id = auth.uid() or public.can_view_all())
));

create policy "history_insert"
on public.work_order_history for insert
with check (exists (
  select 1 from public.work_orders wo
  where wo.id = work_order_id
    and (wo.resident_id = auth.uid() or wo.vendor_id = auth.uid() or public.is_staff())
));

create or replace function public.history_actor_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.actor := coalesce(public.current_role_name(), new.actor);
  new.occurred_at := now();
  return new;
end;
$$;

create trigger history_actor_guard
  before insert on public.work_order_history
  for each row execute procedure public.history_actor_guard();

-- ============================================================
-- 7. Realtime
-- ============================================================

alter publication supabase_realtime add table public.work_orders, public.work_order_history;
