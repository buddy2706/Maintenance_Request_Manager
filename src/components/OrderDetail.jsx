import { useState } from 'react';
import { useAppState } from '../store/AppState.jsx';
import { STATE_LABEL, VENDORS } from '../lib/workOrders.js';

const OWNER_COLOR = {
  resident: 'text-[var(--info)]',
  manager: 'text-[var(--accent)]',
  vendor: 'text-[var(--copper)]',
};

function ActionButton({ onClick, children, variant = 'primary' }) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--accent)] text-white hover:opacity-90'
      : variant === 'danger'
      ? 'border border-[var(--crit)] text-[var(--crit)] hover:bg-[var(--crit)]/10'
      : 'border border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]';
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors ${styles}`}
    >
      {children}
    </button>
  );
}

export default function OrderDetail({ order, onClose }) {
  const { dispatch } = useAppState();
  const [vendor, setVendor] = useState(VENDORS[0]);
  const [holdReason, setHoldReason] = useState('Awaiting parts');
  const [schedule, setSchedule] = useState('Tomorrow 2–4pm');

  if (!order) return null;

  const act = (type, payload) => dispatch({ type, id: order.id, payload });

  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-[var(--muted)]">{order.id}</div>
          <h3 className="text-lg font-bold tracking-tight">{order.category} — {order.symptom}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-[var(--muted)]">
            <span className={`font-mono uppercase tracking-wide ${OWNER_COLOR[order.priority === 'emergency' ? 'manager' : 'manager']}`}>
              {STATE_LABEL[order.state]}
            </span>
            {order.priority === 'emergency' && (
              <span className="rounded-full bg-[var(--crit)]/10 px-2 py-0.5 text-[var(--crit)]">Emergency</span>
            )}
            {order.repeat && <span className="rounded-full bg-[var(--warn)]/10 px-2 py-0.5 text-[var(--warn)]">Repeat</span>}
            {order.vendor && <span>Vendor: {order.vendor}</span>}
          </div>
        </div>
        <button onClick={onClose} className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">✕</button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {order.state === 'submitted' && (
          <>
            <ActionButton onClick={() => act('TRIAGE', {})}>Triage</ActionButton>
            <ActionButton variant="secondary" onClick={() => act('REQUEST_INFO')}>Request info from resident</ActionButton>
            <ActionButton variant="danger" onClick={() => act('TRIAGE', { emergency: true })}>Flag emergency</ActionButton>
          </>
        )}

        {order.state === 'triaged' && (
          <>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
            >
              {VENDORS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <ActionButton onClick={() => act('ASSIGN_VENDOR', { vendor })}>Assign vendor</ActionButton>
          </>
        )}

        {order.state === 'offered' && (
          <>
            <ActionButton onClick={() => act('VENDOR_ACCEPT')}>Vendor accepts</ActionButton>
            <ActionButton variant="danger" onClick={() => act('VENDOR_DECLINE')}>Vendor declines / times out</ActionButton>
          </>
        )}

        {order.state === 'scheduling' && (
          <>
            <input
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
            />
            <ActionButton onClick={() => act('LOCK_SCHEDULE', { when: schedule })}>Lock time & start job</ActionButton>
          </>
        )}

        {order.state === 'in_progress' && (
          <>
            <ActionButton onClick={() => act('COMPLETE')}>Mark completed</ActionButton>
            <input
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
            />
            <ActionButton variant="secondary" onClick={() => act('PUT_ON_HOLD', { reason: holdReason })}>Put on hold</ActionButton>
          </>
        )}

        {order.state === 'on_hold' && <ActionButton onClick={() => act('RESUME')}>Approve — resume scheduling</ActionButton>}

        {order.state === 'resolved' && (
          <>
            <ActionButton onClick={() => act('CONFIRM_FIXED')}>Resident confirms fixed</ActionButton>
            <ActionButton variant="danger" onClick={() => act('REPORT_NOT_FIXED')}>Resident: not fixed — reopen</ActionButton>
          </>
        )}
      </div>

      <div className="border-t border-[var(--line)] pt-3">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">History</div>
        <ol className="flex flex-col gap-2">
          {[...order.history].reverse().map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[12.5px]">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[var(--accent)]" />
              <span className="text-[var(--muted)]">{new Date(h.at).toLocaleString()}</span>
              <span className={`${OWNER_COLOR[h.actor] ?? ''} font-medium uppercase font-mono text-[10.5px]`}>{h.actor}</span>
              <span className="text-[var(--ink-soft)]">{h.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
