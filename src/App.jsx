import { useState } from 'react';
import { ProfileProvider, useProfile } from './store/ProfileContext.jsx';
import { AppStateProvider } from './store/AppState.jsx';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import Simulator from './components/Simulator.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';

const BASE_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'simulator', label: 'Workflow Simulator' },
];

function Shell() {
  const { profile, signOut } = useProfile();
  const [tab, setTab] = useState('dashboard');
  const tabs = profile.role === 'admin' ? [...BASE_TABS, { key: 'admin', label: 'Admin' }] : BASE_TABS;

  return (
    <AppStateProvider>
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
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--line)] px-3 py-1.5 font-mono text-xs capitalize text-[var(--muted)]">
                {profile.role}
                {profile.display_name ? ` · ${profile.display_name}` : ''}
              </span>
              <ThemeToggle />
              <button
                onClick={signOut}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--crit)] hover:text-[var(--crit)]"
              >
                Sign out
              </button>
            </div>
          </header>

          <nav className="mb-7 flex gap-2 border-b border-[var(--line)]">
            {tabs.map((t) => (
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

          {tab === 'dashboard' && <Dashboard />}
          {tab === 'simulator' && <Simulator />}
          {tab === 'admin' && <AdminPanel />}

          <footer className="mt-10 flex flex-wrap justify-between gap-4 border-t border-[var(--line)] pt-4 text-[12.5px] text-[var(--muted)]">
            <span>Built from the maintenance-friction bet document set — docs 00–09.</span>
            <span>Backed by Supabase — data is shared and live across signed-in users.</span>
          </footer>
        </div>
      </div>
    </AppStateProvider>
  );
}

function Gate() {
  const { session, profile, loading } = useProfile();

  if (loading) {
    return <div className="grid min-h-svh place-items-center bg-[var(--ground)] text-[var(--muted)]">Loading…</div>;
  }
  if (!session) return <Auth />;
  if (!profile) {
    return (
      <div className="grid min-h-svh place-items-center bg-[var(--ground)] text-[var(--muted)]">
        Setting up your account…
      </div>
    );
  }
  return <Shell />;
}

export default function App() {
  return (
    <ProfileProvider>
      <Gate />
    </ProfileProvider>
  );
}
