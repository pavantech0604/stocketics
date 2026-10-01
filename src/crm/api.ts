import PocketBase, { BaseAuthStore, ClientResponseError } from 'pocketbase';
import type { CRMState } from './types';

// Keep the authenticated identity in memory; never mix it with legacy browser credentials.
export const crm = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090', new BaseAuthStore());
crm.autoCancellation(false);
export const getCRMState = () => crm.send<CRMState>('/api/crm/state', { method: 'GET' });
export const command = (body: Record<string, unknown>) => crm.send('/api/crm/action', { method: 'POST', body });
export const uploadDocument = (body: FormData) => crm.send('/api/crm/document', { method: 'POST', body });
export function errorMessage(error: unknown): string {
  if (error instanceof ClientResponseError) {
    const fields = Object.values(error.response?.data || {}).map((v: any) => v.message).filter(Boolean);
    return fields.length ? fields.join(' ') : error.response?.message || 'Cannot reach the CRM server. Check your connection and retry.';
  }
  return error instanceof Error ? error.message : 'The action failed. Please retry.';
}
export async function downloadDocument(id: string, filename: string) {
  const response = await fetch(crm.baseURL + '/api/crm/document/' + encodeURIComponent(id), { headers: { Authorization: crm.authStore.token } });
  if (!response.ok) throw new Error('Document access failed. Refresh your session and try again.');
  downloadBlob(await response.blob(), filename);
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const cell = (v: unknown) => { let s = String(v ?? ''); if (/^[=+@\-\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  downloadBlob(new Blob(['\uFEFF' + [keys.map(cell).join(','), ...rows.map(r => keys.map(k => cell(r[k])).join(','))].join('\r\n')], { type: 'text/csv;charset=utf-8' }), filename);
}
