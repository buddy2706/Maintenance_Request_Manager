export default function StatCard({ label, value, delta, tone = 'good' }) {
  const deltaColor = tone === 'warn' ? 'text-[var(--warn)]' : tone === 'crit' ? 'text-[var(--crit)]' : 'text-[var(--good)]';
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4 pb-3.5 shadow-[var(--shadow)]">
      <div className="absolute inset-y-0 left-0 w-[3px] bg-[var(--good)]" />
      <div className="mb-2.5 min-h-[2.7em] text-[12.5px] leading-snug text-[var(--muted)]">{label}</div>
      <div className="font-mono text-[28px] font-semibold leading-none tracking-tight">{value}</div>
      {delta && <div className={`mt-2.5 font-mono text-[12.5px] font-semibold ${deltaColor}`}>{delta}</div>}
    </div>
  );
}
