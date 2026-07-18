import { useEffect, useState } from 'react';

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function ThemeToggle() {
  const [mode, setMode] = useState(() => document.documentElement.getAttribute('data-theme') || (systemPrefersDark() ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <button
      onClick={() => setMode((m) => (m === 'dark' ? 'light' : 'dark'))}
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 font-mono text-xs text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <span>{mode === 'dark' ? '☾' : '☀'}</span>
      <span>{mode === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
