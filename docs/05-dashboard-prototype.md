# Dashboard Prototype — Metrics That Track Value

**Design principle:** every tile answers "did we remove work, time, or rework — and is the customer's business responding?" No vanity counts.

```
┌──────────────────────────────────────────────────────────────────────┐
│  MAINTENANCE COORDINATION — VALUE DASHBOARD        Portfolio ▾  30d ▾ │
├──────────────────────────────────────────────────────────────────────┤
│  RECOGNIZED VALUE (headline)                                          │
│  Coordination minutes removed / WO ▲   Median time-to-resolution ▼    │
│  Manager touches / WO ▼                Repeat-visit rate ▼            │
├────────────────────────────┬─────────────────────────────────────────┤
│  LEADING INDICATORS         │  LAGGING INDICATORS                      │
│  (predict value)            │  (confirm value)                         │
│  • Guided-intake completion │  • Median & p90 time-to-resolution       │
│    rate                     │  • Manager touches per work order        │
│  • % WOs triage-ready at    │  • Coordination minutes per WO           │
│    submission (no clarify)  │  • Repeat-visit rate                     │
│  • Vendor accept time (p50) │  • First-time-fix rate                   │
│  • % WOs on shared thread   │  • Reopened-work-order rate              │
├────────────────────────────┼─────────────────────────────────────────┤
│  OPERATIONAL METRICS        │  RENEWAL / EXPANSION SIGNALS             │
│  • Active WOs by state      │  • Workflow adoption % (by account)      │
│  • SLA breaches / escalations│ • Adoption ↔ renewal-rate correlation   │
│  • No-response reassignments│  • Resident "status" contact volume ▼    │
│  • Emergency fast-path count│  • Accounts crossing "can't-live-w/o"    │
│                             │    usage threshold                       │
│                             │  • Expansion (portfolio/seats) in        │
│                             │    high-adoption accounts                │
└────────────────────────────┴─────────────────────────────────────────┘
Guardrails (watch, don't optimize): resident satisfaction micro-check,
vendor decline rate, quality (reopened rate must not rise as time falls).
```

**How to read it (PM framing):** Leading indicators tell us *value is coming* (intake completing, requests arriving triage-ready). Lagging indicators *confirm value landed* (time, touches, rework down). Renewal/expansion signals tell us the customer's business *recognized* it. A drop in time-to-resolution that comes with a rise in reopened rate isn't value — it's corner-cutting; the guardrails catch that.
