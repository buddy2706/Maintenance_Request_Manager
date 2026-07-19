export const STATES = [
  'submitted',
  'triaged',
  'offered',
  'scheduling',
  'in_progress',
  'on_hold',
  'resolved',
];

export const STATE_LABEL = {
  submitted: 'Submitted',
  triaged: 'Triaged',
  offered: 'Assigned / Offered',
  scheduling: 'Scheduling',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  resolved: 'Completed / Closed',
};

// Kanban dot-color legend only (visually: whose card this "belongs to" at a glance).
export const STATE_OWNER = {
  submitted: 'resident',
  triaged: 'manager',
  offered: 'vendor',
  scheduling: 'vendor',
  in_progress: 'vendor',
  on_hold: 'manager',
  resolved: 'resident',
};

// Who is authorized to perform the *next* transition out of a state — used for
// role-gating action buttons. Deliberately separate from STATE_OWNER: e.g. a
// submitted order visually "belongs" to the resident who filed it, but it's the
// manager who acts on it next (triage / request info / flag emergency).
export const NEXT_ACTOR = {
  submitted: 'manager',
  triaged: 'manager',
  offered: 'vendor',
  scheduling: 'vendor',
  in_progress: 'vendor',
  on_hold: 'manager',
  resolved: 'resident',
};

export const CATEGORIES = {
  Plumbing: ['Leaking faucet', 'Clogged drain', 'Running toilet', 'No hot water'],
  Electrical: ['Outlet not working', 'Flickering lights', 'Breaker keeps tripping'],
  HVAC: ['No heat', 'AC not cooling', 'Strange noise from unit'],
  Appliance: ['Fridge not cooling', 'Dishwasher not draining', 'Washer won’t spin'],
  Pest: ['Ants in kitchen', 'Signs of rodents'],
  Structural: ['Ceiling water stain', 'Door won’t latch'],
};

// Illustrative pre-workflow baseline, from the bet document's own evidence section.
export const BASELINE = {
  medianResolutionDays: 5.1,
  managerTouchesPerWO: 6.2,
  repeatVisitRate: 0.34,
  clarifyRate: 0.46,
};

export function randomRequest(rand = Math.random) {
  const categories = Object.keys(CATEGORIES);
  const category = categories[Math.floor(rand() * categories.length)];
  const symptoms = CATEGORIES[category];
  const symptom = symptoms[Math.floor(rand() * symptoms.length)];
  return { category, symptom };
}

// id/seq/createdAt are assigned by Postgres on insert — this only computes the
// fields a resident's submission needs to send.
export function createWorkOrder({ category, symptom, priority = 'standard' }, now) {
  const ts = now ?? Date.now();
  return {
    category,
    symptom,
    priority,
    state: 'submitted',
    updatedAt: ts,
    resolvedAt: null,
    managerTouches: 0,
    clarifyRequested: false,
    repeat: false,
    reassignCount: 0,
    vendorId: null,
    scheduledFor: null,
    onHoldReason: null,
    history: [
      { at: ts, actor: 'resident', action: 'submitted', label: 'Resident submitted guided intake' },
    ],
  };
}

function log(order, actor, action, label, now) {
  const ts = now ?? Date.now();
  return {
    ...order,
    updatedAt: ts,
    history: [...order.history, { at: ts, actor, action, label }],
  };
}

export function requestInfo(order, now) {
  const ts = now ?? Date.now();
  return log({ ...order, clarifyRequested: true, managerTouches: order.managerTouches + 1 }, 'manager', 'request_info', 'Manager requested clarification before triage', ts);
}

export function triage(order, { emergency = false } = {}, now) {
  const ts = now ?? Date.now();
  const priority = emergency ? 'emergency' : order.priority;
  const nextState = emergency ? 'offered' : 'triaged';
  const label = emergency ? 'Manager flagged emergency — skipping queue to dispatch' : 'Manager triaged and set priority';
  return log({ ...order, priority, state: nextState, managerTouches: order.managerTouches + 1 }, 'manager', 'triaged', label, ts);
}

export function assignVendor(order, vendorId, now) {
  const ts = now ?? Date.now();
  return log(
    { ...order, state: 'offered', vendorId, managerTouches: order.managerTouches + 1 },
    'manager',
    'assigned',
    'Manager assigned a vendor',
    ts
  );
}

export function vendorAccept(order, now) {
  const ts = now ?? Date.now();
  return log({ ...order, state: 'scheduling' }, 'vendor', 'accepted', 'Vendor accepted the job', ts);
}

export function vendorDeclineOrTimeout(order, now) {
  const ts = now ?? Date.now();
  return log(
    { ...order, state: 'triaged', vendorId: null, reassignCount: order.reassignCount + 1 },
    'vendor',
    'declined',
    'Vendor declined / timed out — back to manager for reassignment',
    ts
  );
}

export function lockSchedule(order, when, now) {
  const ts = now ?? Date.now();
  return log({ ...order, state: 'in_progress', scheduledFor: when }, 'vendor', 'scheduled', `Time locked for ${when} — all three notified`, ts);
}

export function putOnHold(order, reason, now) {
  const ts = now ?? Date.now();
  return log({ ...order, state: 'on_hold', onHoldReason: reason }, 'vendor', 'on_hold', `On hold: ${reason}`, ts);
}

export function resumeFromHold(order, now) {
  const ts = now ?? Date.now();
  return log({ ...order, state: 'scheduling', onHoldReason: null }, 'manager', 'resumed', 'Approved — rejoins scheduling', ts);
}

export function complete(order, now) {
  const ts = now ?? Date.now();
  return log({ ...order, state: 'resolved', resolvedAt: ts }, 'vendor', 'completed', 'Vendor marked done with evidence', ts);
}

export function confirmFixed(order, now) {
  const ts = now ?? Date.now();
  return log(order, 'resident', 'confirmed', 'Resident confirmed fixed — closed', ts);
}

export function reportNotFixed(order, now) {
  const ts = now ?? Date.now();
  return log(
    { ...order, state: 'triaged', repeat: true, resolvedAt: null, managerTouches: order.managerTouches + 1 },
    'resident',
    'reopened',
    'Resident reported not fixed — reopened as a repeat',
    ts
  );
}

function median(nums) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(nums, p) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

export function computeMetrics(orders) {
  const resolved = orders.filter((o) => o.state === 'resolved');
  const active = orders.filter((o) => o.state !== 'resolved');
  const days = resolved.map((o) => (o.resolvedAt - o.createdAt) / (1000 * 60 * 60 * 24));

  const medianDays = median(days);
  const p90Days = percentile(days, 90);
  const avgTouches = orders.length ? orders.reduce((s, o) => s + o.managerTouches, 0) / orders.length : 0;
  const repeatRate = resolved.length ? resolved.filter((o) => o.repeat).length / resolved.length : 0;
  const clarifyRate = orders.length ? orders.filter((o) => o.clarifyRequested).length / orders.length : 0;
  const triageReadyRate = 1 - clarifyRate;
  const emergencyCount = orders.filter((o) => o.priority === 'emergency').length;
  const reassignTotal = orders.reduce((s, o) => s + o.reassignCount, 0);
  const slaBreaches = orders.filter((o) => {
    const ageHrs = (Date.now() - o.updatedAt) / (1000 * 60 * 60);
    return (o.state === 'offered' || o.state === 'scheduling') && ageHrs > 24;
  }).length;

  const byState = Object.fromEntries(STATES.map((s) => [s, orders.filter((o) => o.state === s).length]));

  return {
    totalOrders: orders.length,
    activeCount: active.length,
    resolvedCount: resolved.length,
    medianDays,
    p90Days,
    avgTouches,
    repeatRate,
    clarifyRate,
    triageReadyRate,
    emergencyCount,
    reassignTotal,
    slaBreaches,
    byState,
  };
}
