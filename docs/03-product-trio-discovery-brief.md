# Product Trio Discovery Brief — Maintenance Friction

**Purpose:** Align PM, Design, and Engineering before we commit build capacity to the maintenance-friction problem.

## Problem framing
Maintenance coordination fails because participants never share a complete picture simultaneously. Each handoff (resident→manager, manager→vendor, vendor→manager→resident) loses information and adds delay. We are investigating a guided workflow that carries complete, structured context across every handoff on a single visible thread.

## Customer insights
- Residents under-describe problems because they don't know what matters; managers then re-interview them.
- Managers experience the work as *dispatching and relaying*, not deciding.
- Vendors' #1 complaint is arriving without enough info to complete the job in one trip.
- Status ambiguity generates a large, avoidable volume of inbound "any update?" contacts.

## Opportunity areas
1. **Guided intake** — turn resident reporting into structured, triage-ready requests.
2. **Assisted dispatch** — get the right vendor the right context in one action.
3. **Shared status thread** — one place all three parties see state, removing status-chasing.
4. **One-trip vendor context** — everything a vendor needs before they arrive.

## Early hypotheses
- **H1:** Structured intake reduces pre-dispatch clarification round-trips.
- **H2:** A shared status thread cuts resident "status" contacts.
- **H3:** Complete vendor context reduces repeat visits.
- **H4:** Together these reduce manager touches per work order without reducing quality.

## Feasibility questions (Engineering)
- Can we model a single work-order thread that all three party types read/write with correct permissions?
- What's the real state of our vendor communication channels (SMS, email, portal) and their reliability?
- Can guided intake be dynamic (branching by issue type) without a heavy rules engine?
- What's the integration surface with existing ticketing/records so this doesn't fork the data model?

## Usability questions (Design)
- What's the lowest-effort intake that still produces triage-ready detail? (Residents won't tolerate a form marathon.)
- How do we make status legible to three audiences with very different literacy and context?
- How do vendors interact — do they log in, or do we meet them where they are (SMS)?
- What are the failure/error states (wrong vendor, no response, reopened issue) and how do they surface?

## Value questions (Product)
- Which handoff, fixed first, produces the most recognized value fastest?
- What's the smallest slice that changes a manager's day enough to be noticed?
- How do we instrument recognized value from day one (labor, time, rework)?
- What would make a customer say "I can't run maintenance without this"?

**Trio kickoff outcome sought:** agreement on the first opportunity to pursue, the riskiest assumption to test, and the smallest experiment that tests it.
