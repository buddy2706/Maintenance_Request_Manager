import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const ROLES = ['guest', 'resident', 'manager', 'vendor', 'admin'];

export default function AdminPanel() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at')
      .then(({ data }) => {
        setProfiles(data ?? []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const changeRole = async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (!error) load();
  };

  if (loading) return <p className="text-[var(--muted)]">Loading users…</p>;

  return (
    <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <h2 className="mb-1 text-lg font-bold tracking-tight">User roles</h2>
      <p className="mb-4 text-[12.5px] text-[var(--muted)]">
        Admin-only. Changes take effect on the affected user's next sign-in.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-[var(--line)] font-mono text-[10.5px] uppercase tracking-widest text-[var(--muted)]">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Email</th>
              <th className="pb-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                <td className="py-2 pr-4">{p.display_name || '—'}</td>
                <td className="py-2 pr-4 text-[var(--muted)]">{p.email || '(guest)'}</td>
                <td className="py-2">
                  <select
                    value={p.role}
                    onChange={(e) => changeRole(p.id, e.target.value)}
                    className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[12px]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
