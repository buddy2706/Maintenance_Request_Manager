import { useState } from 'react';
import { useAppState } from '../store/AppState.jsx';
import { useProfile } from '../store/ProfileContext.jsx';
import { STATE_LABEL, NEXT_ACTOR } from '../lib/workOrders.js';

const OWNER_COLOR = {
  resident: 'text-[var(--info)]',
  manager: 'text-[var(--accent)]',
  vendor: 'text-[var(--copper)]',
  admin: 'text-[var(--crit)]',
  guest: 'text-[var(--muted)]',
};

function ActionButton({ onClick, children, variant = 'primary' }) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--accent)] text-white hover:opacity-90'
      : variant === 'danger'
      ? 'border border-[var(--crit)] text-[var(--crit)] hover:bg-[var(--crit)]/10'
      : 'border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]';
  return (
    <button onClick={onClick} className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${styles}`}>
      {children}
    </button>
  );
}

export default function OrderDetail({ order, onClose }) {
  const { vendors, actions } = useAppState();
  const { profile } = useProfile();
  const [vendorId, setVendorId] = useState('');
  const [holdReason, setHoldReason] = useState('Awaiting parts');
  const [schedule, setSchedule] = useState('Tomorrow 2–4pm');

  if (!order) return null;

  const canAct = profile.role === 'admin' || profile.role === NEXT_ACTOR[order.state];
  const vendorName = vendors.find((v) => v.id === order.vendorId)?.display_name;
  const selectedVendor = vendorId || vendors[0]?.id || '';

  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-[var(--muted)]">{order.seq ? `WO-${1000 + order.seq}` : order.id.slice(0, 8)}</div>
          <h3 className="text-lg font-bold tracking-tight">
            {order.category} — {order.symptom}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--muted)]">
            <span className="font-mono uppercase tracking-wide text-[var(--accent)]">{STATE_LABEL[order.state]}</span>
            {order.priority === 'emergency' && (
              <span className="rounded-full bg-[var(--crit)]/10 px-2 py-0.5 text-[var(--crit)]">Emergency</span>
            )}
            {order.repeat && <span className="rounded-full bg-[var(--warn)]/10 px-2 py-0.5 text-[var(--warn)]">Repeat</span>}
            {vendorName && <span>Vendor: {vendorName}</span>}
          </div>
        </div>
        <button onClick={onClose} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          ✕
        </button>
      </div>

      {!canAct && (
        <p className="mb-4 text-[12.5px] text-[var(--muted)]">
          Read-only — this stage is waiting on {NEXT_ACTOR[order.state]}.
        </p>
      )}

      {canAct && (
        <div className="mb-4 flex flex-wrap gap-2">
          {order.state === 'submitted' && (
            <>
              <ActionButton onClick={() => actions.triage(order.id, {})}>Triage</ActionButton>
              <ActionButton variant="secondary" onClick={() => actions.requestInfo(order.id)}>
                Request info from resident
              </ActionButton>
              <ActionButton variant="danger" onClick={() => actions.triage(order.id, { emergency: true })}>
                Flag emergency
              </ActionButton>
            </>
          )}

          {order.state === 'triaged' && (
            <>
              <select
                value={selectedVendor}
                onChange={(e) => setVendorId(e.target.value)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
              >
                {vendors.length === 0 && <option value="">No vendors signed up yet</option>}
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.display_name || v.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <ActionButton onClick={() => selectedVendor && actions.assignVendor(order.id, selectedVendor)}>
                Assign vendor
              </ActionButton>
            </>
          )}

          {order.state === 'offered' && (
            <>
              <ActionButton onClick={() => actions.vendorAccept(order.id)}>Vendor accepts</ActionButton>
              <ActionButton variant="danger" onClick={() => actions.vendorDecline(order.id)}>
                Vendor declines / times out
              </ActionButton>
            </>
          )}

          {order.state === 'scheduling' && (
            <>
              <input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
              />
              <ActionButton onClick={() => actions.lockSchedule(order.id, schedule)}>Lock time & start job</ActionButton>
            </>
          )}

          {order.state === 'in_progress' && (
            <>
              <ActionButton onClick={() => actions.complete(order.id)}>Mark completed</ActionButton>
              <input
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
              />
              <ActionButton variant="secondary" onClick={() => actions.putOnHold(order.id, holdReason)}>
                Put on hold
              </ActionButton>
            </>
          )}

          {order.state === 'on_hold' && <ActionButton onClick={() => actions.resume(order.id)}>Approve — resume scheduling</ActionButton>}

          {order.state === 'resolved' && (
            <>
              <ActionButton onClick={() => actions.confirmFixed(order.id)}>Resident confirms fixed</ActionButton>
              <ActionButton variant="danger" onClick={() => actions.reportNotFixed(order.id)}>
                Resident: not fixed — reopen
              </ActionButton>
            </>
          )}
        </div>
      )}

      <div className="border-t border-[var(--line)] pt-3">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">History</div>
        <ol className="flex flex-col gap-2">
          {[...order.history].reverse().map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px]">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[var(--accent)]" />
              <span className="text-[var(--muted)]">{new Date(h.at).toLocaleString()}</span>
              <span className={`${OWNER_COLOR[h.actor] ?? ''} font-mono text-[10.5px] font-medium uppercase`}>{h.actor}</span>
              <span className="text-[var(--ink-soft)]">{h.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
