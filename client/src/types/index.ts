export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  specialties: string; // JSON stringified array
  workSchedule: string; // JSON stringified object
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  barberId: string;
  barber: Barber;
  serviceId: string;
  service: Service;
  customerId: string;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailabilityResponse {
  barberId: string;
  date: string;
  dayOff: boolean;
  workStart?: string;
  workEnd?: string;
  slots: TimeSlot[];
  totalSlots?: number;
  availableCount?: number;
}

export interface CreateAppointmentInput {
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  startTime?: string;
  endTime?: string;
  serviceId?: string;
  status?: AppointmentStatus;
  notes?: string;
}

// Parsed versions of JSON fields
export interface BarberSpecialties {
  specialties: string[];
}

export interface WorkScheduleDay {
  start: string;
  end: string;
}

export type WorkSchedule = Record<string, WorkScheduleDay>;
