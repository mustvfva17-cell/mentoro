-- ============================================================================
-- Precepta — Supabase setup: RLS + real admin authorization
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).
-- Safe to re-run: objects/policies are dropped or use IF NOT EXISTS first.
--
-- WHY THIS SHAPE (read this before running):
--
-- The previous version of this script treated ANY authenticated user as an
-- admin. That's wrong the moment there's more than one legitimate reason to
-- be an authenticated user, and it's fragile even now. This version adds a
-- real authorization layer: a dedicated admin_users table, checked through a
-- SECURITY DEFINER helper function, so only people you explicitly designate
-- can read or update applications — not just "anyone who managed to log in."
--
-- Why a table instead of app_metadata / JWT custom claims (the other option
-- Supabase supports): both are legitimate. A role stored in app_metadata is
-- slightly cheaper to check (no DB lookup) but has a real downside for an
-- admin tool — it's baked into the JWT at login time, so revoking access
-- doesn't take effect until that person's token expires or refreshes
-- (up to ~1 hour by default). A table is checked fresh on every request, so
-- adding or removing a row takes effect immediately, it's trivial to audit
-- ("who's an admin? select * from admin_users"), and it never touches
-- auth.users or the Admin API at all. At this scale (a handful of admins),
-- the performance difference is not measurable.
-- ============================================================================

-- 1. Make sure Row Level Security is switched on for both application tables.
alter table public.student_applications enable row level security;
alter table public.physician_applications enable row level security;

-- 2. The admin allowlist itself. New table — does not touch the existing
--    application tables' schema in any way.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,                          -- for your own reference only; never used for authorization
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- Deliberately NO policies on this table. RLS enabled + zero policies means
-- nobody — not even authenticated users — can read or write it through the
-- API. The only thing allowed to look inside it is the function below,
-- which runs with elevated privileges specifically so RLS on THIS table
-- doesn't block the lookup it needs to do.

-- 3. The authorization check itself. SECURITY DEFINER lets it read
--    admin_users despite that table having no policies; search_path is
--    pinned to '' and every reference is schema-qualified, which is the
--    standard hardening against search-path hijacking for this kind of
--    function (per Supabase's own security-definer guidance).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 4. Clear any existing versions of the application-table policies
--    (including the old "any authenticated user" ones) before recreating.
drop policy if exists "Public can submit student applications"   on public.student_applications;
drop policy if exists "Admins can view student applications"     on public.student_applications;
drop policy if exists "Admins can update student applications"   on public.student_applications;
drop policy if exists "Public can submit physician applications" on public.physician_applications;
drop policy if exists "Admins can view physician applications"   on public.physician_applications;
drop policy if exists "Admins can update physician applications" on public.physician_applications;

-- 5. Public (anon) visitors may INSERT applications only — and every new
--    row must start as 'pending'. Without this check clause, a client
--    talking to the REST API directly (bypassing the site's own form)
--    could insert a row with status already set to 'approved'. The
--    with-check closes that regardless of what the client sends.
create policy "Public can submit student applications"
  on public.student_applications
  for insert
  to anon, authenticated
  with check (status = 'pending');

create policy "Public can submit physician applications"
  on public.physician_applications
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- 6. Only designated admins (per admin_users, via is_admin()) may SELECT.
create policy "Admins can view student applications"
  on public.student_applications
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can view physician applications"
  on public.physician_applications
  for select
  to authenticated
  using (public.is_admin());

-- 7. Only designated admins may UPDATE (used for approve/reject/pending).
create policy "Admins can update student applications"
  on public.student_applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can update physician applications"
  on public.physician_applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Note: there is intentionally no DELETE policy anywhere, for anon or
-- authenticated. That means deletion is blocked entirely through the API,
-- for everyone — which matches the dashboard only ever exposing Approve /
-- Reject / Return to Pending, never a delete action.

-- ============================================================================
-- HOW TO ADD AN ADMIN (do this for each teammate who needs access):
--
--   1. Create their login: Dashboard → Authentication → Users → Add User.
--
--   2. Find their user id — either copy it from that same Users list, or run:
--        select id, email from auth.users where email = 'them@precepta.co';
--
--   3. Grant access by adding them to the allowlist:
--        insert into public.admin_users (user_id, email)
--        values ('paste-their-uuid-here', 'them@precepta.co');
--
-- To revoke access, just delete their row — it takes effect immediately,
-- no need to wait for a token to expire:
--   delete from public.admin_users where email = 'them@precepta.co';
--
-- One more thing worth knowing: because admin status now depends on being
-- in admin_users (not just on being logged in at all), it's no longer
-- security-critical to disable public sign-ups the way the previous
-- version of this script required — a self-registered account still
-- wouldn't be in admin_users, so is_admin() would correctly return false
-- for it. Turning sign-ups off (Authentication → Sign In / Providers →
-- Email) is still sensible hygiene, since nothing on this site has a
-- legitimate reason to let strangers create accounts, but it's no longer
-- the only thing standing between a random visitor and your data.
-- ============================================================================
