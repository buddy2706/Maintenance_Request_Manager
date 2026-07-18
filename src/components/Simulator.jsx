import { useState } from 'react';
import { useAppState } from '../store/AppState.jsx';
import { CATEGORIES, STATES, STATE_LABEL, STATE_OWNER, randomRequest } from '../lib/workOrders.js';
import OrderDetail from './OrderDetail.jsx';

const OWNER_DOT = {
  resident: 'bg-[var(--info)]',
  manager: 'bg-[var(--accent)]',
  vendor: 'bg-[var(--copper)]',
};

function OrderCard({ order, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left shadow-[var(--shadow)] transition-colors ${
        selected ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]'
      }`}
    >
      <div className="mb-1 flex items-center justify-between font-mono text-[10.5px] text-[var(--muted)]">
        <span>{order.id}</span>
        {order.priority === 'emergency' && <span className="text-[var(--crit)]">EMERGENCY</span>}
      </div>
      <div className="text-[13px] font-medium text-[var(--ink)]">{order.category}</div>
      <div className="text-[12px] text-[var(--ink-soft)]">{order.symptom}</div>
      {order.repeat && <div className="mt-1 text-[11px] text-[var(--warn)]">↺ repeat</div>}
    </button>
  );
}

export default function Simulator() {
  const { orders, dispatch } = useAppState();
  const [selectedId, setSelectedId] = useState(null);
  const [category, setCategory] = useState(Object.keys(CATEGORIES)[0]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  const submitNew = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const symptom = form.get('symptom');
    dispatch({ type: 'NEW_ORDER', payload: { category, symptom } });
  };

  const submitRandom = () => {
    dispatch({ type: 'NEW_ORDER', payload: randomRequest() });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3 rounded-[14px] border border-dashed border-[var(--line)] bg-[var(--surface-2)] p-4">
        <form onSubmit={submitNew} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
            >
              {Object.keys(CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">Symptom</label>
            <select
              name="symptom"
              className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-[12.5px]"
            >
              {CATEGORIES[category].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[12.5px] font-medium text-white hover:opacity-90">
            Resident submits request
          </button>
        </form>
        <button
          onClick={submitRandom}
          className="rounded-full border border-[var(--line)] px-4 py-1.5 text-[12.5px] font-medium text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          🎲 Random request
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="ml-auto rounded-full border border-[var(--line)] px-4 py-1.5 text-[12.5px] font-medium text-[var(--muted)] hover:border-[var(--crit)] hover:text-[var(--crit)]"
        >
          Reset simulation
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATES.map((state) => {
          const inState = orders.filter((o) => o.state === state);
          return (
            <div key={state} className="w-[220px] flex-none">
              <div className="mb-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${OWNER_DOT[STATE_OWNER[state]]}`} />
                <span className="text-[13px] font-semibold tracking-tight">{STATE_LABEL[state]}</span>
                <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">{inState.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {inState.map((o) => (
                  <OrderCard key={o.id} order={o} selected={o.id === selectedId} onSelect={() => setSelectedId(o.id)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <OrderDetail order={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
