import type {
  Appointment,
  AuthSession,
  AvailabilityResponse,
  Barber,
  CreateBookingInput,
  CreateBookingResponse,
  Service,
  TenantContextData,
  UpdateAppointmentInput,
  AdminCatalogData,
  AdminPaymentsData,
  AdminSettingsData,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
let csrfToken = '';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function tenantSlug() {
  const configured = import.meta.env.VITE_TENANT_SLUG as string | undefined;
  if (configured) return configured;
  const [subdomain] = window.location.hostname.split('.');
  return subdomain && !['www', 'localhost', '127'].includes(subdomain) ? subdomain : 'blades';
}

export function setCsrfToken(token: string) {
  csrfToken = token;
}

async function fetchJSON<T>(url: string, options: RequestInit = {}, useTenant = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && options.body !== undefined) headers.set('content-type', 'application/json');
  if (useTenant) headers.set('x-tenant-slug', tenantSlug());
  if (csrfToken && options.method && !['GET', 'HEAD'].includes(options.method)) headers.set('x-csrf-token', csrfToken);

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      body?.error?.message ?? 'No pudimos completar la operación',
      body?.error?.code ?? 'REQUEST_FAILED',
      response.status,
      body?.error?.details,
    );
  }
  return body as T;
}

export const getTenantContext = () => fetchJSON<TenantContextData>('/public/context', {}, true);
export const getBarbers = () => fetchJSON<Barber[]>('/public/barbers', {}, true);
export const getServices = () => fetchJSON<Service[]>('/public/services', {}, true);
export const getBarber = async (id: string) => {
  const barber = (await getBarbers()).find((item) => item.id === id);
  if (!barber) throw new ApiError('Barbero no encontrado', 'NOT_FOUND', 404);
  return barber;
};
export const getService = async (id: string) => {
  const service = (await getServices()).find((item) => item.id === id);
  if (!service) throw new ApiError('Servicio no encontrado', 'NOT_FOUND', 404);
  return service;
};

export function getAvailability(input: {
  date: string;
  serviceIds: string[];
  barberId?: string;
  locationId?: string;
}) {
  const query = new URLSearchParams({ date: input.date, serviceIds: input.serviceIds.join(',') });
  if (input.barberId) query.set('barberId', input.barberId);
  if (input.locationId) query.set('locationId', input.locationId);
  return fetchJSON<AvailabilityResponse>(`/public/availability?${query}`, {}, true);
}

export const createAppointment = (data: CreateBookingInput) =>
  fetchJSON<CreateBookingResponse>('/public/appointments', { method: 'POST', body: JSON.stringify(data) }, true);

export async function uploadReferenceImage(token: string, file: File) {
  const form = new FormData();
  form.append('referenceImage', file);
  return fetchJSON<{ id: string }>('/public/appointments/manage/reference-images', {
    method: 'POST', body: form, headers: { 'x-appointment-token': token },
  }, true);
}

export const getManagedAppointment = (token: string) =>
  fetchJSON<Appointment>('/public/appointments/manage', { headers: { 'x-appointment-token': token } }, true);

export const cancelManagedAppointment = (token: string, reason?: string) =>
  fetchJSON<Appointment>('/public/appointments/manage', {
    method: 'PATCH', headers: { 'x-appointment-token': token }, body: JSON.stringify({ action: 'cancel', reason }),
  }, true);

export const rescheduleManagedAppointment = (token: string, date: string, startTime: string) =>
  fetchJSON<Appointment>('/public/appointments/manage', {
    method: 'PATCH',
    headers: { 'x-appointment-token': token },
    body: JSON.stringify({ action: 'reschedule', date, startTime }),
  }, true);

export const accessAppointment = (publicCode: string, phone: string) =>
  fetchJSON<{ appointment: Appointment; manageToken: string; manageUrl: string }>('/public/appointments/access', {
    method: 'POST', body: JSON.stringify({ publicCode, phone }),
  }, true);

export const settleSandboxPayment = (paymentId: string, outcome: 'paid' | 'failed') =>
  fetchJSON<{ status: string; duplicate: boolean }>(`/public/payments/sandbox/${encodeURIComponent(paymentId)}`, {
    method: 'POST', body: JSON.stringify({ outcome }),
  }, true);

export const login = (email: string, password: string) =>
  fetchJSON<{ user: AuthSession['user']; csrf: string }>('/auth/login', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }, true);
export async function authMe() {
  const response = await fetchJSON<(AuthSession & { authenticated: true }) | { authenticated: false }>('/auth/me');
  return response.authenticated ? response : null;
}
export const logout = () => fetchJSON<void>('/auth/logout', { method: 'POST' });
export const getBilling = () => fetchJSON<{
  status: string;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  plan: { name: string; priceCents: number; currency: string; billingPeriod: string };
}>('/billing');
export const requestReactivation = () =>
  fetchJSON<{ message: string; portalUrl: string }>('/billing/reactivation', {
    method: 'POST',
    body: JSON.stringify({}),
  });

export async function getAppointments(filters?: {
  date?: string;
  barberId?: string;
  status?: string;
}) {
  const query = new URLSearchParams();
  if (filters?.date) query.set('date', filters.date);
  if (filters?.barberId) query.set('barberId', filters.barberId);
  if (filters?.status) query.set('status', filters.status);
  const response = await fetchJSON<{ items: Appointment[] }>(`/admin/appointments${query.size ? `?${query}` : ''}`);
  return response.items;
}
export const getAppointment = (id: string) => fetchJSON<Appointment>(`/admin/appointments/${id}`);
export const updateAppointment = (id: string, data: UpdateAppointmentInput) =>
  fetchJSON<Appointment>(`/admin/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const cancelAppointment = (id: string) =>
  fetchJSON<Appointment>(`/admin/appointments/${id}`, { method: 'DELETE', body: JSON.stringify({}) });

export const getAdminSettings = () => fetchJSON<AdminSettingsData>('/admin/settings');
export const updateAdminSettings = (data: unknown) =>
  fetchJSON<AdminSettingsData>('/admin/settings', { method: 'PATCH', body: JSON.stringify(data) });
export const getAdminCatalog = () => fetchJSON<AdminCatalogData>('/admin/catalog');
export const createAdminCategory = (data: unknown) =>
  fetchJSON('/admin/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminCategory = (id: string, data: unknown) =>
  fetchJSON(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const createAdminService = (data: unknown) =>
  fetchJSON('/admin/services', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminService = (id: string, data: unknown) =>
  fetchJSON(`/admin/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const createAdminBarber = (data: unknown) =>
  fetchJSON('/admin/barbers', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminBarber = (id: string, data: unknown) =>
  fetchJSON(`/admin/barbers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const getAdminPayments = (filters?: { status?: string; method?: string }) => {
  const query = new URLSearchParams();
  if (filters?.status) query.set('status', filters.status.toUpperCase());
  if (filters?.method) query.set('method', filters.method.toUpperCase());
  return fetchJSON<AdminPaymentsData>(`/admin/payments${query.size ? `?${query}` : ''}`);
};
export const markAdminCashPaymentPaid = (id: string) =>
  fetchJSON<{ id: string; status: string; paidAt: string | null }>(`/admin/payments/${id}/paid`, { method: 'PATCH', body: JSON.stringify({}) });
