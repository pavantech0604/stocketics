/**
 * Typed endpoints for the CRM (slice 2): leads, lead requests, clients, DND, import, CRM settings and
 * notifications. Built on the shared fetch wrapper in ./client.ts (cookie session + CSRF + 401 handling).
 */
import { api, type PagedResult } from './client';

export interface LeadDto {
  id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  source: string;
  campaign: string;
  description: string;
  priority: 'High' | 'Normal' | 'Low';
  /** crm.js vocabulary. The legacy portal labels (New Lead, Trial Active) are not mapped yet. */
  status: 'New' | 'In Contact' | 'Qualified' | 'Lost' | 'Converted';
  ownerId: string | null;
  ownerName: string | null;
  teamLeaderId: string | null;
  teamLeaderName: string | null;
  managerId: string | null;
  managerName: string | null;
  isArchived: boolean;
  isDnd: boolean;
  lastResponse: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Echo this back on every change to the lead; a stale value yields 409. */
  version: number;
}

export interface LeadActivityDto {
  id: string;
  type: string;
  note: string;
  outcome: string | null;
  actorName: string;
  actorRole: string;
  at: string;
  statusAtTime: string;
  nextDueAt: string | null;
  originalActivityId: string | null;
  followUpId: string | null;
  detail: string | null;
}

export interface LeadDetailDto {
  lead: LeadDto;
  activity: LeadActivityDto[];
  followUps: { id: string; dueAt: string; status: string; response: string | null; completedAt: string | null }[];
  assignments: {
    id: string;
    type: string;
    source: string;
    previousOwnerName: string | null;
    previousTeamLeaderName: string | null;
    newOwnerName: string | null;
    newTeamLeaderName: string | null;
    actorName: string;
    reason: string;
    requestId: string | null;
    at: string;
  }[];
  clientId: string | null;
}

export interface LeadRequestDto {
  id: string;
  ownerId: string;
  ownerName: string | null;
  teamLeaderId: string;
  teamLeaderName: string | null;
  managerId: string | null;
  state: string;
  count: number;
  remarks: string;
  requiredBy: string | null;
  status: string;
  approvedCount: number;
  allocatedCount: number;
  history: { action: string; actorName: string; note: string | null; at: string }[];
  createdAt: string;
  version: number;
}

export interface ClientDto {
  id: string;
  clientCode: string;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  source: string;
  campaign: string;
  status: 'Active' | 'Hold' | 'Expired';
  isDnd: boolean;
  ownerId: string | null;
  ownerName: string | null;
  teamLeaderId: string | null;
  managerId: string | null;
  convertedAt: string;
  version: number;
}

export interface ImportRowResult {
  row: number;
  status: 'Created' | 'Duplicate' | 'Failed';
  message: string | null;
  leadId: string | null;
}

export interface ImportBatchDto {
  id: string;
  fileName: string;
  actorName: string;
  total: number;
  created: number;
  duplicates: number;
  failed: number;
  assignedToTeamLeaderId: string | null;
  at: string;
  results: ImportRowResult[] | null;
}

export interface LeadInput {
  name: string;
  phone: string;
  email?: string;
  state: string;
  city?: string;
  source: string;
  campaign?: string;
  priority?: string;
  description?: string;
}

export interface CrmSettings {
  maxRequest: number;
  aadhaarBackRequired: boolean;
  states: string[];
  sources: string[];
}

const qs = (params: Record<string, unknown>): string => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  return p.size ? `?${p}` : '';
};

export const leadsApi = {
  list: (
    params: {
      q?: string; status?: string; state?: string; source?: string; priority?: string; ownerId?: string;
      teamLeaderId?: string; unassigned?: boolean; archived?: boolean; dueFrom?: string; dueTo?: string;
      page?: number; pageSize?: number;
    } = {},
  ) => api.get<PagedResult<LeadDto>>(`/leads${qs(params)}`),
  get: (id: string) => api.get<LeadDetailDto>(`/leads/${id}`),
  create: (body: LeadInput & { managerId?: string }) => api.post<LeadDto>('/leads', body),
  update: (id: string, body: LeadInput & { priority: string; version: number }) => api.put<LeadDto>(`/leads/${id}`, body),
  assign: (
    items: { leadId: string; version: number }[],
    targetId: string,
    opts: { targetRole?: 'team_leader' | 'employee'; reason?: string; requestId?: string } = {},
  ) => api.post<{ count: number }>('/leads/assign', { items, targetId, ...opts }),
  respond: (
    id: string,
    body: { version: number; note: string; outcome?: string; nextDue?: string; followUpId?: string; correctsActivityId?: string },
  ) => api.post<LeadDto>(`/leads/${id}/responses`, body),
  changeStatus: (id: string, version: number, status: LeadDto['status'], reason?: string) =>
    api.post<LeadDto>(`/leads/${id}/status`, { version, status, reason }),
  archive: (id: string, version: number, reason: string) => api.post<LeadDto>(`/leads/${id}/archive`, { version, reason }),
  restore: (id: string, version: number, reason: string) => api.post<LeadDto>(`/leads/${id}/restore`, { version, reason }),
  convert: (id: string, version: number) => api.post<ClientDto>(`/leads/${id}/convert`, { version }),
  /** Rows come from the spreadsheet the browser already parsed; the server validates and records every row. */
  import: (body: {
    fileName?: string; source?: string; managerId?: string; teamLeaderId?: string;
    rows: { name?: string; phone?: string; email?: string; state?: string; city?: string; source?: string; campaign?: string }[];
  }) => api.post<ImportBatchDto>('/leads/import', body),
  imports: () => api.get<ImportBatchDto[]>('/leads/imports'),
  importResult: (id: string) => api.get<ImportBatchDto>(`/leads/imports/${id}`),
};

export const leadRequestsApi = {
  list: () => api.get<LeadRequestDto[]>('/lead-requests'),
  create: (body: { state: string; count: number; remarks?: string; requiredBy?: string; draft?: boolean }) =>
    api.post<LeadRequestDto>('/lead-requests', body),
  review: (id: string, body: { version: number; status: string; count?: number; comment?: string }) =>
    api.post<LeadRequestDto>(`/lead-requests/${id}/review`, body),
};

export const clientsApi = {
  list: (params: { q?: string; status?: string; ownerId?: string; page?: number; pageSize?: number } = {}) =>
    api.get<PagedResult<ClientDto>>(`/clients${qs(params)}`),
  get: (id: string) =>
    api.get<{ client: ClientDto; notes: unknown[]; subscriptions: unknown[]; trials: unknown[] }>(`/clients/${id}`),
  setStatus: (id: string, version: number, status: ClientDto['status']) =>
    api.post<ClientDto>(`/clients/${id}/status`, { version, status }),
  addNote: (id: string, text: string, response?: string) => api.post(`/clients/${id}/notes`, { text, response }),
  addSubscription: (id: string, body: Record<string, unknown>) => api.post(`/clients/${id}/subscriptions`, body),
  addTrial: (id: string, body: Record<string, unknown>) => api.post(`/clients/${id}/trials`, body),
};

export const dndApi = {
  list: (params: { q?: string; page?: number; pageSize?: number } = {}) =>
    api.get<PagedResult<{ id: string; phone: string; clientName: string | null; reason: string }>>(`/dnd${qs(params)}`),
  add: (phone: string, reason: string, leadId?: string) => api.post('/dnd', { phone, reason, leadId }),
  remove: (id: string) => api.delete<void>(`/dnd/${id}`),
};

export const crmSettingsApi = {
  get: () => api.get<CrmSettings>('/settings/crm'),
  update: (body: { maxRequest: number; aadhaarBackRequired: boolean; sources: string[] }) =>
    api.put<CrmSettings>('/settings/crm', body),
};

export const notificationsApi = {
  list: () => api.get<{ id: string; title: string; leadId: string | null; isRead: boolean; at: string }[]>('/notifications'),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read`),
};
