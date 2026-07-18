# PRD — Guided Maintenance Workflow (Outcome-Driven)

**Feature name:** Guided Maintenance Workflow
**Author / Trio:** [PM] · [Design] · [Eng]  **Status:** Draft

## Problem
Maintenance coordination runs on phone tag, scattered channels, and manual triage. Every handoff between resident, manager, and vendor loses information and time, driving slow resolution, high manager labor per work order, and eroded trust.

## Goals (outcomes)
- Reduce median and p90 time-to-resolution.
- Reduce manager touches and coordination minutes per work order.
- Reduce pre-dispatch clarification round-trips and repeat visits.
- Reduce resident "status" contact volume.

## Non-Goals
- Not building a repair-diagnosis/AI-technician engine.
- Not replacing accounting/payments (integrate, don't rebuild).
- Not a vendor marketplace or vendor-sourcing product (this release).
- Not owner-facing reporting (later phase).

## User Stories (jobs to be done)
- *As a resident,* when something breaks, I want to report it once and clearly, and see where it stands, so I never have to chase anyone.
- *As a manager,* when a request arrives, I want it already triage-ready and dispatchable in one action, so I stop being the switchboard.
- *As a manager,* when a vendor goes quiet, I want the system to nudge/reassign automatically, so no request stalls silently.
- *As a vendor,* when I'm assigned work, I want complete context up front, so I fix it in one trip.
- *As all three,* when I ask "where is this?", I want the tracker to answer — not a person.

## Success Metrics
- **Primary:** median time-to-resolution ↓, manager touches/WO ↓.
- **Secondary:** pre-dispatch clarification rate ↓, repeat-visit rate ↓, resident status-contact volume ↓, guided-intake completion rate ↑.
- **Guardrails:** reopened-WO rate flat/down, resident satisfaction micro-check flat/up, vendor decline rate stable.

## Constraints
- Must integrate with existing work-order data model (no fork).
- Vendors may not log in — meet them via SMS/email where needed.
- Permissions: three party types on one thread, correctly scoped.
- Intake must stay short enough that residents finish it.

## Rollout Plan
1. **Alpha:** 2–3 design-partner accounts, one issue category (e.g., plumbing), instrument everything.
2. **Beta:** expand categories + accounts; validate metric movement vs. baseline.
3. **GA:** phased by portfolio size; enablement + adoption tracking.
4. **Guardrail gate:** advance a phase only if primary metrics move *and* guardrails hold.
