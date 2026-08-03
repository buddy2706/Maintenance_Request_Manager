# Maintenance Coordination — Value & Flow

A multi-user simulation of the **Guided Maintenance Workflow** bet — a Property mgmt–style
product concept for property-maintenance coordination between residents, property managers,
and vendors.

Sign in as one of five roles and run real work orders through the full state machine
(Submitted → Triaged → Assigned/Offered → Scheduling → In Progress → Resolved, plus emergency,
on-hold, and reopened branches). Data is shared and synced live across everyone signed in.

## Why this exists

This app is built directly from a product document set (see [`docs/`](./docs)) that frames the
underlying bet: maintenance coordination is a structural handoff problem between three parties,
and a guided workflow with one shared, status-visible thread removes the handoffs where time and
information get lost. `docs/01-bet-document.md` and `docs/06-prd.md` are the core references;
`docs/05-dashboard-prototype.md` defines the metrics this dashboard implements.

## Roles

| Role | How you get it | Can do |
|---|---|---|
| **Guest** | "Continue as guest" button (Supabase anonymous sign-in) — no signup | Read-only: browse the dashboard and the board, no actions |
| **Resident** | Self-service signup, role dropdown | Submit requests, confirm-fixed / reopen a resolved order |
| **Property manager** | Self-service signup, role dropdown | Triage, request info, flag emergency, assign vendors, approve holds |
| **Vendor** | Self-service signup, role dropdown | Accept/decline offers, lock a schedule, complete or hold in-progress jobs |
| **Admin** | Manual bootstrap only (see below) | Everything managers can do, plus change any user's role via the Admin tab |

**Known, deliberate simplifications** (this is a portfolio demo, not a production system):
resident/manager/vendor are self-selected at signup with no invite/approval flow — anyone can
sign up as "manager" and see everything. This also diverges from the original bet document's
constraint that vendors don't get logins. Admin is *not* self-selectable (the signup trigger
clamps it), which is what actually gates who can reassign roles.

## What it does

- **Dashboard** — recognized-value KPIs (time-to-resolution, manager touches/WO, repeat-visit
  rate, pre-dispatch clarification rate) computed live from real work orders and compared
  against an illustrative pre-workflow baseline pulled from the bet document's own evidence
  section, plus leading/lagging/operational/guardrail signal detail.
- **Workflow Simulator** — a kanban-style board of the state machine, role-gated so each signed-in
  user only sees the actions relevant to them (enforced both in the UI and by Postgres Row Level
  Security + column-guard triggers — see the migration file).
- **Admin** — reassign any user's role.

## Stack

React 19 + Vite + Tailwind CSS v4 + [Supabase](https://supabase.com) (Postgres, Auth, Realtime).

## Setup

1. Create a free Supabase project. Under **Authentication → Providers**, enable **Anonymous
   sign-ins** (needed for the guest role).
2. Run [`supabase/migrations/0001_schema_rls.sql`](./supabase/migrations/0001_schema_rls.sql) in
   the Supabase SQL Editor — creates the tables, RLS policies, and guard triggers.
3. Copy `.env.example` to `.env.local` and fill in your project's URL and `anon` public key
   (Settings → API). Never use the `service_role` key here.
4. `npm install && npm run dev`.
5. Sign up once through the app, then bootstrap yourself to admin:
   ```sql
   update public.profiles set role = 'admin' where id = '<your-user-id-from-auth.users>';
   ```

## Deploying

Zero-config deploy to [Vercel](https://vercel.com): import this repo, framework preset "Vite",
and add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as environment variables.
