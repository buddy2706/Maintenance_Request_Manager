import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const ROLES = [
  { value: 'resident', label: 'Resident' },
  { value: 'manager', label: 'Property manager' },
  { value: 'vendor', label: 'Vendor' },
];

const inputClass =
  'rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('resident');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: authError } =
      mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { data: { role, display_name: displayName } } })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) setError(authError.message);
  };

  const continueAsGuest = async () => {
    setBusy(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInAnonymously();
    setBusy(false);
    if (authError) setError(authError.message);
  };

  return (
    <div className="grid min-h-svh place-items-center bg-[var(--ground)] px-5 text-[var(--ink)]">
      <div className="w-full max-w-sm rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
          Property Meld · Bet Instrumentation
        </div>
        <h1 className="mb-5 text-xl font-bold tracking-tight">Maintenance Coordination</h1>

        <div className="mb-4 flex gap-1 rounded-full border border-[var(--line)] p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
              mode === 'signin' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 rounded-full py-1.5 font-medium transition-colors ${
              mode === 'signup' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />

          {mode === 'signup' && (
            <>
              <input
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
              />
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] leading-snug text-[var(--muted)]">
                Demo signup — any role is available for exploring the app.
              </p>
            </>
          )}

          {error && <p className="text-[12.5px] text-[var(--crit)]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-[var(--accent)] py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-5 border-t border-[var(--line)] pt-4">
          <button
            type="button"
            onClick={continueAsGuest}
            disabled={busy}
            className="w-full rounded-full border border-[var(--line)] py-2 text-[13px] font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-60"
          >
            Continue as guest (read-only)
          </button>
        </div>
      </div>
    </div>
  );
}
