# Stakeholder Alignment Brief — Guided Maintenance Workflow

**Subject:** Why we're building the Guided Maintenance Workflow — and what your team needs to know.

**The problem.** Maintenance coordination runs on phone tag and manual triage. Every handoff between resident, manager, and vendor loses information and time. It's slow, labor-heavy, and quietly costs us renewals.

**Why it matters now.** Maintenance is our most frequent, most emotional customer touchpoint. If our product doesn't *reduce the work* around it, we're a record-keeper for a painful process — replaceable. Owning the coordination layer is how we become the software maintenance *runs on*, which is what renews and expands.

**What the solution changes.** Structured resident intake, assisted one-click dispatch with full vendor context, and a shared status thread that answers "where is this?" without a human. Net effect: fewer round-trips, faster resolution, less manager labor.

## What each team needs to know
- **IT / Engineering:** Builds on the existing work-order data model (no fork). Key surfaces: three-party permissions on one thread, vendor comms via SMS/email, SLA timers/escalation. Early feasibility input requested.
- **Support:** Expect a shift — fewer "status" tickets, but new questions during rollout. We'll equip you with the new states and error flows. Your ticket data is our baseline; help us instrument it.
- **Customer Success:** This is a retention/expansion story. Adoption of the workflow is the leading signal you'll manage against; we'll surface a per-account adoption view. Bring your at-risk and workaround-heavy accounts as design partners.
- **Leadership:** Success is measured as recognized value — labor, time, and rework removed — correlated to renewal/expansion, not feature counts.

## Risks & mitigations
- *Resident intake friction* → keep intake short, branch dynamically, nudge don't block; measure completion.
- *Vendor won't adopt a portal* → meet them on SMS/email; no login required.
- *Speed at the cost of quality* → guardrail on reopened rate; a phase can't advance if quality drops.
- *Scope creep (diagnosis, payments, marketplace)* → explicit non-goals; integrate don't rebuild.

**The ask:** one point of contact per team for the trio, and your baseline data so we measure value honestly from day one.
