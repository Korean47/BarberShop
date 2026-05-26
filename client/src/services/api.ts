import type {
  Barber,
  Service,
  Appointment,
  AvailabilityResponse,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// --- Barbers ---
export const getBarbers = () => fetchJSON<Barber[]>('/barbers');

export const getBarber = (id: string) => fetchJSON<Barber>(`/barbers/${id}`);

export const getBarberAvailability = (barberId: string, date: string, duration?: number) =>
  fetchJSON<AvailabilityResponse>(
    `/barbers/${barberId}/availability?date=${date}${duration ? `&duration=${duration}` : ''}`
  );

// --- Services ---
export const getServices = () => fetchJSON<Service[]>('/services');

export const getService = (id: string) => fetchJSON<Service>(`/services/${id}`);

// --- Appointments ---
export const getAppointments = (filters?: {
  date?: string;
  barberId?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();
  if (filters?.date) params.set('date', filters.date);
  if (filters?.barberId) params.set('barberId', filters.barberId);
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return fetchJSON<Appointment[]>(`/appointments${query ? `?${query}` : ''}`);
};

export const getAppointment = (id: string) =>
  fetchJSON<Appointment>(`/appointments/${id}`);

export const createAppointment = (data: CreateAppointmentInput) =>
  fetchJSON<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateAppointment = (id: string, data: UpdateAppointmentInput) =>
  fetchJSON<Appointment>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const cancelAppointment = (id: string) =>
  fetchJSON<Appointment>(`/appointments/${id}`, {
    method: 'DELETE',
  });
