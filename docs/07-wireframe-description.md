# Wireframe Description (Low-Fidelity) — Guided Maintenance Workflow

## A) Resident — Guided Intake (mobile-first)
- **Layout:** single-column, one decision per screen, progress dots at top.
- **Components:** category tiles (Plumbing / Electrical / Appliance / HVAC / Other) → symptom picker (branches by category) → photo/video upload (large dropzone, "add a photo helps us fix it faster") → "Can we enter if you're out?" toggle + notes → availability chips → review card → Submit.
- **User actions:** tap category, pick symptom, attach media, set access, confirm.
- **System responses:** on submit, a **tracker card** with plain-language status ("Received — being reviewed") and a persistent link.
- **Error states:** no photo → soft nudge, not a block; upload fail → retry inline; required access answer → inline prompt.

## B) Manager — Triage & Dispatch (desktop)
- **Layout:** two-pane. Left: prioritized queue of triage-ready WOs (badge: priority, category, age, SLA timer). Right: WO detail.
- **Components:** detail shows structured intake, photos, access notes, availability; **priority selector**; **"Assign vendor"** with recommended vendors + one-click dispatch; "Request more info" secondary action; emergency fast-path banner.
- **User actions:** open WO, set priority, assign vendor (one click sends full context), or request info.
- **System responses:** status advances to Assigned; vendor + resident auto-notified; SLA timer starts.
- **Error states:** vendor declines → inline reassign; no response past timer → red "action needed"; duplicate detected → merge prompt.

## C) Shared Status Thread (all parties)
- **Layout:** vertical timeline; state chips (Submitted → Triaged → Assigned → Scheduled → In Progress → Resolved); message composer at bottom.
- **Components:** system events + human messages interleaved; scheduled-time card; "Mark en route / complete" for vendor; "Confirm fixed / Not fixed" for resident at completion.
- **User actions:** message, confirm time, mark status, confirm resolution.
- **System responses:** each action posts a legible event + notifies the right parties only.
- **Error states:** "Not fixed" → reopens as flagged repeat; no-show → auto-reschedule offer + escalation.

## D) Vendor — Job Card (mobile/SMS-friendly)
- **Layout:** single card: address + access notes, symptom + photos, resident availability, Accept/Decline.
- **Actions:** accept, propose time, mark en route, mark complete + add notes/photos.
- **System responses:** accept → scheduling; complete → resident confirmation requested.
- **Error states:** decline → returns to manager; expired offer → auto-reassign.
