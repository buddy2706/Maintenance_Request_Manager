import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useProfile } from './ProfileContext.jsx';
import * as wo from '../lib/workOrders.js';

const AppStateContext = createContext(null);

function fromRow(row) {
  return {
    id: row.id,
    seq: row.seq,
    category: row.category,
    symptom: row.symptom,
    priority: row.priority,
    state: row.state,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at).getTime() : null,
    managerTouches: row.manager_touches,
    clarifyRequested: row.clarify_requested,
    repeat: row.repeat,
    reassignCount: row.reassign_count,
    residentId: row.resident_id,
    vendorId: row.vendor_id,
    scheduledFor: row.scheduled_for,
    onHoldReason: row.on_hold_reason,
    history: (row.work_order_history ?? [])
      .slice()
      .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))
      .map((h) => ({ at: new Date(h.occurred_at).getTime(), actor: h.actor, action: h.action, label: h.label })),
  };
}

// Local (camelCase) field -> DB column, for diffing what a transition changed.
const FIELD_TO_COLUMN = {
  state: 'state',
  priority: 'priority',
  managerTouches: 'manager_touches',
  clarifyRequested: 'clarify_requested',
  repeat: 'repeat',
  reassignCount: 'reassign_count',
  vendorId: 'vendor_id',
  scheduledFor: 'scheduled_for',
  onHoldReason: 'on_hold_reason',
  resolvedAt: 'resolved_at',
  updatedAt: 'updated_at',
};

function diffToColumns(prev, next) {
  const changes = {};
  for (const [field, column] of Object.entries(FIELD_TO_COLUMN)) {
    if (next[field] !== prev[field]) {
      changes[column] =
        field === 'resolvedAt' || field === 'updatedAt' ? (next[field] ? new Date(next[field]).toISOString() : null) : next[field];
    }
  }
  return changes;
}

export function AppStateProvider({ children }) {
  const { profile } = useProfile();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('work_orders').select('*, work_order_history(*)').order('created_at');
    setOrders((data ?? []).map(fromRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel('work-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, refetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_order_history' }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    if (profile?.role !== 'manager' && profile?.role !== 'admin') {
      setVendors([]);
      return;
    }
    supabase
      .from('profiles')
      .select('id, display_name')
      .eq('role', 'vendor')
      .then(({ data }) => setVendors(data ?? []));
  }, [profile?.role]);

  const persist = useCallback(async (prevOrder, nextOrder) => {
    // History insert MUST happen before the work_orders update: its RLS check
    // authorizes via the *current* work_orders row (e.g. vendor_id = auth.uid()),
    // and some transitions (vendor decline) clear that same ownership column —
    // updating first would make the insert's ownership check fail.
    const newEntry = nextOrder.history[nextOrder.history.length - 1];
    await supabase.from('work_order_history').insert({
      work_order_id: prevOrder.id,
      actor: newEntry.actor,
      action: newEntry.action,
      label: newEntry.label,
    });
    const changes = diffToColumns(prevOrder, nextOrder);
    if (Object.keys(changes).length) {
      await supabase.from('work_orders').update(changes).eq('id', prevOrder.id);
    }
  }, []);

  const metrics = useMemo(() => wo.computeMetrics(orders), [orders]);

  const findOrder = useCallback((id) => orders.find((o) => o.id === id), [orders]);

  const actions = useMemo(
    () => ({
      async newOrder({ category, symptom }) {
        const draft = wo.createWorkOrder({ category, symptom });
        const { data } = await supabase
          .from('work_orders')
          .insert({
            category: draft.category,
            symptom: draft.symptom,
            priority: draft.priority,
            state: draft.state,
            resident_id: profile.id,
          })
          .select()
          .single();
        if (data) {
          await supabase.from('work_order_history').insert({
            work_order_id: data.id,
            actor: 'resident',
            action: 'submitted',
            label: 'Resident submitted guided intake',
          });
        }
      },
      requestInfo(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.requestInfo(order));
      },
      triage(id, opts) {
        const order = findOrder(id);
        if (order) persist(order, wo.triage(order, opts));
      },
      assignVendor(id, vendorId) {
        const order = findOrder(id);
        if (order) persist(order, wo.assignVendor(order, vendorId));
      },
      vendorAccept(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.vendorAccept(order));
      },
      vendorDecline(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.vendorDeclineOrTimeout(order));
      },
      lockSchedule(id, when) {
        const order = findOrder(id);
        if (order) persist(order, wo.lockSchedule(order, when));
      },
      putOnHold(id, reason) {
        const order = findOrder(id);
        if (order) persist(order, wo.putOnHold(order, reason));
      },
      resume(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.resumeFromHold(order));
      },
      complete(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.complete(order));
      },
      confirmFixed(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.confirmFixed(order));
      },
      reportNotFixed(id) {
        const order = findOrder(id);
        if (order) persist(order, wo.reportNotFixed(order));
      },
    }),
    [findOrder, persist, profile?.id]
  );

  const value = useMemo(() => ({ orders, metrics, vendors, loading, actions }), [orders, metrics, vendors, loading, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
