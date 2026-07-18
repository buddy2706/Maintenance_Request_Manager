import { useState } from 'react';
import { AppStateProvider } from './store/AppState.jsx';
import Dashboard from './components/Dashboard.jsx';
import Simulator from './components/Simulator.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'simulator', label: 'Workflow Simulator' },
];

function Shell() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="min-h-svh bg-[var(--ground)] px-5 py-10 text-[var(--ink)] sm:px-10">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
              Property Meld · Bet Instrumentation
            </div>
            <h1 className="mt-2 max-w-[18ch] text-[clamp(26px,4vw,40px)] font-extrabold leading-[1.02] tracking-tight">
              Maintenance Coordination — Value &amp; Flow
            </h1>
            <p className="mt-2 max-w-[62ch] text-[15px] text-[var(--muted)]">
              A live simulation of the guided maintenance workflow bet: run work orders through the state machine
              and watch the recognized-value dashboard respond.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <nav className="mb-7 flex gap-2 border-b border-[var(--line)]">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-3 py-2 text-[14px] font-medium transition-colors ${
                tab === t.key
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'dashboard' ? <Dashboard /> : <Simulator />}

        <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-[var(--line)] pt-4 text-[12.5px] text-[var(--muted)]">
          <span>Built from the maintenance-friction bet document set — docs 00–09.</span>
          <span>Sample/simulated data — not connected to a real backend.</span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
