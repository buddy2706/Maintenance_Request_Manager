import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import * as wo from '../lib/workOrders.js';

const STORAGE_KEY = 'mf-work-orders-v1';

const AppStateContext = createContext(null);

function reducer(state, action) {
  const updateOrder = (id, updater) => state.map((o) => (o.id === id ? updater(o) : o));

  switch (action.type) {
    case 'LOAD':
      return action.orders;
    case 'RESET':
      return seedDemoOrders();
    case 'NEW_ORDER': {
      const order = wo.createWorkOrder(action.payload);
      return [order, ...state];
    }
    case 'REQUEST_INFO':
      return updateOrder(action.id, (o) => wo.requestInfo(o));
    case 'TRIAGE':
      return updateOrder(action.id, (o) => wo.triage(o, action.payload));
    case 'ASSIGN_VENDOR':
      return updateOrder(action.id, (o) => wo.assignVendor(o, action.payload.vendor));
    case 'VENDOR_ACCEPT':
      return updateOrder(action.id, (o) => wo.vendorAccept(o));
    case 'VENDOR_DECLINE':
      return updateOrder(action.id, (o) => wo.vendorDeclineOrTimeout(o));
    case 'LOCK_SCHEDULE':
      return updateOrder(action.id, (o) => wo.lockSchedule(o, action.payload.when));
    case 'PUT_ON_HOLD':
      return updateOrder(action.id, (o) => wo.putOnHold(o, action.payload.reason));
    case 'RESUME':
      return updateOrder(action.id, (o) => wo.resumeFromHold(o));
    case 'COMPLETE':
      return updateOrder(action.id, (o) => wo.complete(o));
    case 'CONFIRM_FIXED':
      return updateOrder(action.id, (o) => wo.confirmFixed(o));
    case 'REPORT_NOT_FIXED':
      return updateOrder(action.id, (o) => wo.reportNotFixed(o));
    default:
      return state;
  }
}

function daysAgo(n) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function seedDemoOrders() {
  const seeds = [
    { category: 'Plumbing', symptom: 'Leaking faucet', createdDaysAgo: 6, path: 'resolved' },
    { category: 'HVAC', symptom: 'No heat', createdDaysAgo: 4, path: 'resolved-repeat' },
    { category: 'Electrical', symptom: 'Breaker keeps tripping', createdDaysAgo: 2, path: 'in_progress' },
    { category: 'Appliance', symptom: 'Fridge not cooling', createdDaysAgo: 1, path: 'scheduling' },
    { category: 'Pest', symptom: 'Ants in kitchen', createdDaysAgo: 3, path: 'offered' },
    { category: 'Structural', symptom: 'Ceiling water stain', createdDaysAgo: 0.5, path: 'triaged' },
    { category: 'Plumbing', symptom: 'Clogged drain', createdDaysAgo: 0.2, path: 'submitted' },
  ];

  return seeds.map((seed, i) => {
    const created = daysAgo(seed.createdDaysAgo);
    let order = wo.createWorkOrder({ category: seed.category, symptom: seed.symptom }, created);
    const vendor = wo.VENDORS[i % wo.VENDORS.length];

    if (seed.path === 'submitted') return order;

    order = wo.triage(order, {}, created + 1000 * 60 * 40);
    if (seed.path === 'triaged') return order;

    order = wo.assignVendor(order, vendor, created + 1000 * 60 * 90);
    if (seed.path === 'offered') return order;

    order = wo.vendorAccept(order, created + 1000 * 60 * 130);
    if (seed.path === 'scheduling') return order;

    order = wo.lockSchedule(order, 'Tomorrow 2–4pm', created + 1000 * 60 * 60 * 5);
    if (seed.path === 'in_progress') return order;

    order = wo.complete(order, created + 1000 * 60 * 60 * 30);
    if (seed.path === 'resolved') return order;

    if (seed.path === 'resolved-repeat') {
      order = wo.reportNotFixed(order, created + 1000 * 60 * 60 * 40);
      order = wo.assignVendor(order, vendor, created + 1000 * 60 * 60 * 41);
      order = wo.vendorAccept(order, created + 1000 * 60 * 60 * 42);
      order = wo.lockSchedule(order, 'Next day 9–11am', created + 1000 * 60 * 60 * 44);
      order = wo.complete(order, created + 1000 * 60 * 60 * 60);
      order = { ...order, repeat: true };
      return order;
    }
    return order;
  });
}

export function AppStateProvider({ children }) {
  const [orders, dispatch] = useReducer(reducer, null, () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore corrupt storage, fall through to seed data
    }
    return seedDemoOrders();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const metrics = useMemo(() => wo.computeMetrics(orders), [orders]);

  const value = useMemo(() => ({ orders, metrics, dispatch }), [orders, metrics]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
