# UX Flow Diagram (Text-Based) — Guided Maintenance Workflow

States, transitions, triggers, and notifications. Suitable for a design partner to convert into wireframes.

```
[START]
  │
  ▼
(RESIDENT) SUBMITTED ──────────────────────────────────────────────
  • Trigger: resident starts a request
  • Guided intake: category → symptom branch → photo/video → access/permission to enter → availability
  • System response: builds structured, triage-ready work order
  • Notify: Manager ("New request — triage-ready")   Resident ("We've got it. Here's your tracker link.")
  │
  ▼
(MANAGER) TRIAGED
  • Trigger: manager reviews structured request
  • Actions: set priority · request more info (→ back to SUBMITTED:needs-info) · classify emergency
  • Branch: EMERGENCY → fast-path dispatch + escalation notify
  • Notify: Resident ("Reviewed — assigning a pro")
  │
  ▼
(MANAGER) ASSIGNED  ──►  (VENDOR) OFFERED
  • Trigger: manager selects vendor
  • System response: sends complete job context (location, symptom, photos, access notes, availability)
  • Vendor actions: ACCEPT → SCHEDULING  |  DECLINE → back to ASSIGNED (reassign)  |  NO RESPONSE (timer) → nudge, then reassign
  • Notify: Vendor ("New job w/ full details")   Resident ("Pro assigned")
  │
  ▼
SCHEDULING
  • Trigger: vendor accepts
  • Actions: propose time ⇄ resident confirms availability (shared thread, no phone tag)
  • Notify: all three when time is locked
  │
  ▼
SCHEDULED  →  IN PROGRESS
  • Trigger: appointment time / vendor marks en route
  • Notify: Resident ("Pro arriving [window]")
  • Actions: vendor logs notes, parts, photos; can flag "needs follow-up / parts" (→ ON HOLD)
  │
  ├─► ON HOLD (parts/approval/second visit)
  │     • Notify: Manager (approval needed) · Resident (delay + reason)
  │     • Resolve → back to SCHEDULING/IN PROGRESS
  │
  ▼
COMPLETED (vendor marks done + evidence)
  • System response: request resident confirmation
  • Branch: Resident CONFIRMS → RESOLVED  |  Resident REPORTS NOT FIXED → REOPENED (→ TRIAGED, flagged repeat)
  │
  ▼
RESOLVED / CLOSED
  • Notify: Resident (satisfaction micro-check) · Manager (closed, cycle-time logged)
  • System response: capture metrics (time-to-resolution, touches, visits, reopened?)
[END]

CROSS-CUTTING:
  • Shared status thread visible to Resident / Manager / Vendor at every state (scoped permissions).
  • Any "status?" question is answered by the tracker, not a person.
  • SLA timers on OFFERED and SCHEDULING auto-escalate on breach → Manager notify.
  • Error states: wrong vendor (reassign), no-show (auto-reschedule + escalate), duplicate request (merge), reopened (repeat-visit flag).
```
