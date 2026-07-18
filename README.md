# Maintenance Coordination — Value & Flow

An interactive simulation of the **Guided Maintenance Workflow** bet — a Property Meld–style
product concept for property-maintenance coordination between residents, property managers,
and vendors.

Run simulated work orders through the full state machine (Submitted → Triaged → Assigned/Offered
→ Scheduling → In Progress → Resolved, plus emergency, on-hold, and reopened branches) and watch
the recognized-value dashboard respond in real time.

## Why this exists

This app is built directly from a product document set (see [`docs/`](./docs)) that frames the
underlying bet: maintenance coordination is a structural handoff problem between three parties,
and a guided workflow with one shared, status-visible thread removes the handoffs where time and
information get lost. `docs/01-bet-document.md` and `docs/06-prd.md` are the core references;
`docs/05-dashboard-prototype.md` defines the metrics this dashboard implements.

## What it does

- **Dashboard** — recognized-value KPIs (time-to-resolution, manager touches/WO, repeat-visit
  rate, pre-dispatch clarification rate) computed live from simulated work orders and compared
  against an illustrative pre-workflow baseline pulled from the bet document's own evidence
  section, plus leading/lagging/operational/guardrail signal detail.
- **Workflow Simulator** — a kanban-style board of the state machine. Submit a new resident
  request, triage it, assign a vendor, accept/decline, lock a schedule, mark on-hold or complete,
  and reopen a "not fixed" report — each action is logged to a per-order history and immediately
  reflected in the dashboard.

State is held in React and persisted to `localStorage` — there's no backend; this is a front-end
demo of the product concept, not a production system.

## Stack

React 19 + Vite + Tailwind CSS v4. No routing library (two view tabs, local state only).

## Getting started

```bash
npm install
npm run dev
```

## Deploying

Zero-config deploy to [Vercel](https://vercel.com): import this repo, framework preset "Vite",
no environment variables needed. `npm run build` outputs a static `dist/` that can also be
hosted on Netlify, GitHub Pages, or any static host.
