export interface Barber {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  specialties: string;
  workSchedule: string;
  serviceIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  duration: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  price: number;
  priceCents: number;
  category: string;
  categoryId: string;
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

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  date: string;
  startsAt: string;
  endsAt: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  totalCents: number;
  currency: string;
  barberId: string;
  barber: Barber;
  serviceId: string;
  service: Service;
  services: { id: string; name: string; duration: number; priceCents: number }[];
  customerId: string;
  customer: Customer;
  location: { id: string; name: string; address: string };
  payment: { id: string; method: 'cash' | 'online'; status: string } | null;
  referenceImages: { id: string; originalName: string; mimeType: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  availableBarbers: { id: string; name: string }[];
}

export interface AvailabilityResponse {
  date: string;
  dayOff: boolean;
  durationMinutes: number;
  location: { id: string; name: string };
  slots: AvailabilitySlot[];
}

export interface TenantContextData {
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  locale: string;
  contactEmail: string | null;
  contactPhone: string | null;
  bookingAvailable: boolean;
  branding: {
    logoUrl: string | null;
    heroImageUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  } | null;
  locations: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string | null;
    phone: string | null;
    isDefault: boolean;
  }[];
  settings: { key: string; value: string }[];
}

export interface CreateBookingInput {
  locationId?: string;
  barberId?: string | null;
  serviceIds: string[];
  date: string;
  startTime: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    consent: true;
  };
  paymentMethod: 'CASH' | 'ONLINE';
}

export interface CreateBookingResponse {
  appointment: Appointment;
  manageToken: string;
  manageUrl: string;
  payment: { clientSecret: string; provider: string } | null;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  notes?: string | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  csrf: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
    subscriptionStatus: string | null;
    graceEndsAt: string | null;
  };
}

export interface TimeSlot {
  start: string;
  end: string;
}

export type WorkSchedule = Record<string, { start: string; end: string }>;
