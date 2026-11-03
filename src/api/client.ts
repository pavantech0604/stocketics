/**
 * Client for the ASP.NET Core API (api/). Same-origin by default: in development Vite proxies /api to the
 * backend, in production Nginx does, so the HttpOnly session cookie never crosses an origin and no CORS or
 * third-party-cookie setup is needed. No token is ever held in JavaScript.
 */

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1';

/** RFC 9457 ProblemDetails, as returned by the API for every non-2xx response. */
export interface ProblemDetails {
  status: number;
  title?: string;
  detail?: string;
  /** Present on 400 validation failures: field name → messages. */
  errors?: Record<string, string[]>;
  traceId?: string;
}

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly problem: ProblemDetails) {
    super(problem.detail || problem.title || `Request failed (${status})`);
    this.name = 'ApiError';
  }

  /** First message for a field, for inline form errors. */
  fieldError(field: string): string | undefined {
    const match = Object.entries(this.problem.errors ?? {}).find(([k]) => k.toLowerCase() === field.toLowerCase());
    return match?.[1]?.[0];
  }
}

let csrfToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Register a callback (e.g. "go to login screen") for when a session expires or is revoked. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/**
 * CSRF tokens are bound to the signed-in identity: call this after login and logout so the next
 * mutating request carries a token that matches the new session.
 */
export async function refreshCsrfToken(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: 'same-origin' });
  if (!res.ok) throw new ApiError(res.status, { status: res.status, title: 'Could not obtain CSRF token' });
  csrfToken = ((await res.json()) as { token: string }).token;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(method: Method, path: string, body?: unknown, retried = false): Promise<T> {
  const unsafe = method !== 'GET';
  if (unsafe && !csrfToken) await refreshCsrfToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(unsafe && csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.ok) return (res.status === 204 ? undefined : await res.json()) as T;

  const problem = (await res.json().catch(() => ({ status: res.status }))) as ProblemDetails;

  // A stale CSRF token (e.g. server restarted) is a 400 with this title: refetch once and retry.
  if (unsafe && res.status === 400 && problem.title === 'Invalid or missing CSRF token' && !retried) {
    csrfToken = null;
    return request<T>(method, path, body, true);
  }
  if (res.status === 401 && path !== '/auth/login') onUnauthorized?.();
  throw new ApiError(res.status, { ...problem, status: res.status });
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

// ── Typed endpoints (slice 1: auth, employees, permissions) ───────────────────────────

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'manager' | 'team_leader' | 'employee';
  department?: string | null;
  title?: string | null;
  permissions: string[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EmployeeDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: CurrentUser['role'];
  department: string;
  title: string;
  status: string;
  isActive: boolean;
  joinDate: string | null;
  dateOfBirth: string | null;
  managerId: string | null;
  leaveBalance: { paid: number; sick: number; comp: number };
  /** null unless the caller holds the admin.payroll permission. */
  salary: number | null;
  /** Send back unchanged on update; a stale value yields a 409. */
  version: number;
}

export const authApi = {
  async login(email: string, password: string): Promise<CurrentUser> {
    await refreshCsrfToken();
    const user = await api.post<CurrentUser>('/auth/login', { email, password });
    await refreshCsrfToken(); // token is identity-bound: replace the anonymous one
    return user;
  },
  async logout(): Promise<void> {
    await api.post<void>('/auth/logout');
    csrfToken = null;
  },
  me: () => api.get<CurrentUser>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post<void>('/auth/change-password', { currentPassword, newPassword }),
};

export const employeesApi = {
  list: (params: { q?: string; role?: string; department?: string; status?: string; active?: boolean; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && v !== '' && qs.set(k, String(v)));
    return api.get<PagedResult<EmployeeDto>>(`/employees${qs.size ? `?${qs}` : ''}`);
  },
  get: (id: string) => api.get<EmployeeDto>(`/employees/${id}`),
  create: (body: Record<string, unknown>) => api.post<EmployeeDto>('/employees', body),
  update: (id: string, body: Record<string, unknown>) => api.put<EmployeeDto>(`/employees/${id}`, body),
  deactivate: (id: string) => api.post<EmployeeDto>(`/employees/${id}/deactivate`),
  activate: (id: string) => api.post<EmployeeDto>(`/employees/${id}/activate`),
  changeRole: (id: string, role: CurrentUser['role']) => api.put<EmployeeDto>(`/employees/${id}/role`, { role }),
  resetPassword: (id: string, newPassword: string) => api.post<void>(`/employees/${id}/reset-password`, { newPassword }),
};

export const permissionsApi = {
  get: () => api.get<{ roles: Record<string, string[]>; catalogue: string[] }>('/permissions'),
  set: (role: string, permissions: string[]) => api.put<void>(`/permissions/${role}`, { permissions }),
};
