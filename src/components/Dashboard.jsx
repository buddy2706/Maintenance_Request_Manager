import { useAppState } from '../store/AppState.jsx';
import { BASELINE, STATE_LABEL } from '../lib/workOrders.js';
import StatCard from './StatCard.jsx';

function fmtDays(d) {
  if (d == null) return '—';
  return `${d.toFixed(1)}d`;
}

function pctDelta(current, baseline, lowerIsBetter = true) {
  if (current == null || !baseline) return null;
  const change = ((current - baseline) / baseline) * 100;
  const improved = lowerIsBetter ? change < 0 : change > 0;
  const arrow = change < 0 ? '▼' : '▲';
  return { text: `${arrow} ${Math.abs(change).toFixed(0)}% vs baseline`, improved };
}

function Quad({ title, sub, children }) {
  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4 pt-4.5 shadow-[var(--shadow)]">
      <h3 className="mb-0.5 text-sm font-bold tracking-tight">{title}</h3>
      <div className="mb-3 font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">{sub}</div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function Metric({ name, value, trend = 'good' }) {
  const color = trend === 'warn' ? 'text-[var(--warn)]' : trend === 'info' ? 'text-[var(--info)]' : 'text-[var(--good)]';
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-2.5 first:border-t-0">
      <span className="text-[13.5px] text-[var(--ink-soft)]">{name}</span>
      <span className={`font-mono text-sm ${color}`}>{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { metrics } = useAppState();

  const resolutionDelta = pctDelta(metrics.medianDays, BASELINE.medianResolutionDays);
  const touchesDelta = pctDelta(metrics.avgTouches, BASELINE.managerTouchesPerWO);
  const repeatDelta = pctDelta(metrics.repeatRate * 100, BASELINE.repeatVisitRate * 100);
  const clarifyDelta = pctDelta(metrics.clarifyRate * 100, BASELINE.clarifyRate * 100);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-4 flex items-baseline gap-3.5">
          <span className="rounded-md border border-[var(--line)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">01</span>
          <h2 className="text-xl font-bold tracking-tight">Recognized Value</h2>
          <span className="ml-auto text-right text-[13px] text-[var(--muted)]">vs. pre-workflow baseline · live simulation</span>
        </div>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <StatCard
            label="Median time-to-resolution"
            value={fmtDays(metrics.medianDays)}
            delta={resolutionDelta?.text}
            tone={resolutionDelta?.improved === false ? 'warn' : 'good'}
          />
          <StatCard
            label="Manager touches per work order"
            value={metrics.avgTouches.toFixed(1)}
            delta={touchesDelta?.text}
            tone={touchesDelta?.improved === false ? 'warn' : 'good'}
          />
          <StatCard
            label="Repeat-visit rate"
            value={`${(metrics.repeatRate * 100).toFixed(0)}%`}
            delta={repeatDelta?.text}
            tone={repeatDelta?.improved === false ? 'warn' : 'good'}
          />
          <StatCard
            label="Pre-dispatch clarification rate"
            value={`${(metrics.clarifyRate * 100).toFixed(0)}%`}
            delta={clarifyDelta?.text}
            tone={clarifyDelta?.improved === false ? 'warn' : 'good'}
          />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-baseline gap-3.5">
          <span className="rounded-md border border-[var(--line)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">02</span>
          <h2 className="text-xl font-bold tracking-tight">Signal Detail</h2>
          <span className="ml-auto text-right text-[13px] text-[var(--muted)]">leading predicts · lagging confirms</span>
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <Quad title="Leading Indicators" sub="Value is coming">
            <Metric name="Triage-ready at submission (no clarify)" value={`${(metrics.triageReadyRate * 100).toFixed(0)}%`} />
            <Metric name="Active work orders" value={metrics.activeCount} trend="info" />
            <Metric name="No-response reassignments" value={metrics.reassignTotal} trend={metrics.reassignTotal > 0 ? 'warn' : 'good'} />
            <Metric name="Emergency fast-path count" value={metrics.emergencyCount} trend="info" />
          </Quad>
          <Quad title="Lagging Indicators" sub="Value landed">
            <Metric name="Time-to-resolution (median / p90)" value={`${fmtDays(metrics.medianDays)} / ${fmtDays(metrics.p90Days)}`} />
            <Metric name="Manager touches per work order" value={metrics.avgTouches.toFixed(1)} />
            <Metric name="Resolved work orders" value={metrics.resolvedCount} />
            <Metric name="Repeat-visit rate" value={`${(metrics.repeatRate * 100).toFixed(0)}%`} trend={metrics.repeatRate > 0.15 ? 'warn' : 'good'} />
          </Quad>
          <Quad title="Operational" sub="Is the machine healthy">
            {Object.entries(metrics.byState)
              .filter(([, count]) => count > 0)
              .map(([state, count]) => (
                <Metric key={state} name={STATE_LABEL[state]} value={count} trend="info" />
              ))}
          </Quad>
          <Quad title="Guardrails" sub="Watch, don't optimize">
            <Metric name="SLA breaches (offered/scheduling > 24h)" value={metrics.slaBreaches} trend={metrics.slaBreaches > 0 ? 'warn' : 'good'} />
            <Metric name="Reopened rate" value={`${(metrics.repeatRate * 100).toFixed(0)}%`} trend={metrics.repeatRate > 0.15 ? 'warn' : 'good'} />
            <Metric name="Total simulated work orders" value={metrics.totalOrders} trend="info" />
          </Quad>
        </div>
      </section>
    </div>
  );
}
