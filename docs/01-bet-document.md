# Bet Document — Guided Maintenance Workflow

## The Problem
Maintenance coordination is structurally broken because no single participant has the full picture at the same time. Residents report vaguely, managers triage manually, vendors work from partial context, and status lives in someone's inbox or head. Every handoff is a place where information is lost and time leaks out. This isn't a feature gap — it's a coordination failure that repeats on every one of the thousands of work orders a portfolio generates each month.

## The Job to Be Done
When something breaks in my home/unit/portfolio, the participants are each hiring the product to do a job:
- **Resident:** "When something's wrong, help me report it once, clearly, and know it's handled — without having to chase anyone."
- **Property manager:** "When a request comes in, help me get the right vendor the right information and close it out — without becoming the switchboard."
- **Vendor:** "When I'm assigned work, give me everything I need to fix it in one trip and get paid — without back-and-forth."

## Evidence
- Maintenance is the single most common support/communication event in property management; coordination — not the repair itself — consumes the majority of cycle time. [Insert internal cycle-time breakdown]
- `[X%]` of work orders require at least one clarifying exchange before a vendor can be dispatched. [Insert from ticket data]
- `[Y%]` of resident escalations are status questions, not new problems — pure "where is this?" overhead. [Insert from support logs]
- Repeat vendor visits driven by incomplete information add `[Z]` days to median resolution. [Insert]
- In interviews, managers describe themselves as "dispatchers" and "message-relayers," not decision-makers. [Insert quotes]

## The Bet
If we replace ad-hoc, multi-channel coordination with a **guided maintenance workflow** — structured intake for residents, assisted triage and dispatch for managers, and complete job context for vendors, all on one status-visible thread — then we will materially reduce time-to-resolution and manager labor per work order, because we remove the handoffs where information and time are lost.

## Expected Outcome
- Fewer clarifying round-trips before dispatch.
- Lower median and 90th-percentile time-to-resolution.
- Reduced manager touches per work order.
- Fewer resident "status" contacts.
- A maintenance experience that shows up in renewal and expansion behavior.

## How We Will Measure Recognized Value
Recognized value = the customer changing behavior because the product removed work they used to do. We measure it as:
- **Labor removed:** manager touches/work order and coordination minutes/work order (down).
- **Time removed:** median + p90 time-to-resolution (down).
- **Rework removed:** repeat-visit rate and pre-dispatch clarification rate (down).
- **Trust earned:** proportion of work orders where residents never had to ask for status.
- **Business signal:** correlation between workflow adoption and renewal/expansion at the account level.
