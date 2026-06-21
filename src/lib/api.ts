/**
 * API layer — the single seam between the app and its backends.
 *
 * Today it serves the bundled datasets and the seeded pulse model so the app is
 * fully functional offline. Flip USE_LOCAL to false (or set EXPO_PUBLIC_API_URL)
 * and every screen pulls from the real services with zero UI changes.
 *
 * Backends this is designed to fan out to:
 *   - Constituency / results service   (GET /constituencies, /results)
 *   - Pulse / listening firehose       (GET /pulse, /pulse/:no)
 *   - Grievance pipeline               (POST /grievances)
 *   - Engagement / subscribe (WhatsApp)(POST /subscribe)
 *   - Push registration                (POST /devices)
 */

import Constants from 'expo-constants';
import { constituencies, results, framework, byNo } from '../data';
import { buildPulse, type Pulse } from './pulse';
import { grievancesFor } from './grievances';

const USE_LOCAL = true;

export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  'https://api.punjabyatra.in';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// In-memory pulse cache (stable across the session).
const pulseCache: Record<number, Pulse> = {};
function localPulse(): Record<number, Pulse> {
  if (Object.keys(pulseCache).length === 0) {
    constituencies.forEach((c) => (pulseCache[c.no] = buildPulse(c.no)));
  }
  return pulseCache;
}

export const api = {
  async getConstituencies() {
    if (USE_LOCAL) return constituencies;
    return request<typeof constituencies>('/constituencies');
  },

  async getResults() {
    if (USE_LOCAL) return results;
    return request<typeof results>('/results');
  },

  async getFramework() {
    if (USE_LOCAL) return framework;
    return request<typeof framework>('/framework');
  },

  async getPulseAll() {
    if (USE_LOCAL) return localPulse();
    return request<Record<number, Pulse>>('/pulse');
  },

  async getConstituency(no: number) {
    if (USE_LOCAL) return { ...byNo[no], pulse: localPulse()[no] };
    return request<any>(`/constituencies/${no}`);
  },

  /** Top citizen grievances for a constituency (most-voted first). */
  async getGrievances(no: number) {
    if (USE_LOCAL) return grievancesFor(no, byNo[no]?.district || '');
    return request<any>(`/constituencies/${no}/grievances`);
  },

  /** Submit a grievance from the voter-journey flow. */
  async submitGrievance(payload: {
    no: number;
    category: string;
    description: string;
    name: string;
    phone: string;
    slot?: string;
  }) {
    if (USE_LOCAL) return { ok: true, id: `local-${Date.now()}`, ...payload };
    return request<{ ok: boolean; id: string }>('/grievances', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Opt a voter into WhatsApp / constituency updates. */
  async subscribe(payload: { no: number; phone?: string; channel: string }) {
    if (USE_LOCAL) return { ok: true };
    return request<{ ok: boolean }>('/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Register this device's push token with the backend. */
  async registerDevice(payload: { token: string; platform: string; no?: number }) {
    if (USE_LOCAL) return { ok: true };
    return request<{ ok: boolean }>('/devices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export type Api = typeof api;
