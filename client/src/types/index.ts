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
  priceType: 'fixed' | 'starting_at' | 'estimate' | 'confirm';
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
  publicCode: string;
  date: string;
  startsAt: string;
  endsAt: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes: string | null;
  totalCents: number;
  currency: string;
  holdExpiresAt: string | null;
  barberId: string;
  barber: Barber;
  serviceId: string;
  service: Service;
  services: { id: string; name: string; duration: number; priceCents: number }[];
  customerId: string;
  customer: Customer;
  location: { id: string; name: string; address: string; mapsUrl: string | null };
  payment: { id: string; method: 'cash' | 'online'; status: string; provider: string | null; checkoutExpiresAt: string | null } | null;
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
  closureLabel: string | null;
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
    heroVideoUrl: string | null;
    heroMobileVideoUrl: string | null;
    heroPosterUrl: string | null;
    heroFallbackUrls: string;
    heroTitle: string;
    heroSubtitle: string;
    shopImageUrl: string | null;
    mapUrl: string | null;
    whatsappUrl: string | null;
    instagramUrl: string | null;
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
    mapsUrl: string | null;
    isDefault: boolean;
    businessSchedules: { dayOfWeek: number; startMinute: number; endMinute: number; isOpen: boolean }[];
    scheduleExceptions: { date: string; isOpen: boolean; startMinute: number | null; endMinute: number | null; label: string | null }[];
  }[];
  settings: { key: string; value: string }[];
  paymentOptions: { cash: boolean; online: boolean; provider: string | null };
  bookingRules: { minimumNoticeMinutes: number; maxAdvanceDays: number; changeCutoffHours: number; holdMinutes: number };
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
  payment: { checkoutUrl: string; provider: string; expiresAt: string } | null;
}

export interface AdminSettingsData {
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  timezone: string;
  currency: string;
  branding: TenantContextData['branding'];
  settings: { key: string; value: string }[];
  locations: TenantContextData['locations'];
  paymentConfiguration: { provider: 'disabled' | 'mock' | 'stripe'; onlineConfigured: boolean; environment: string };
}

export interface AdminCatalogData {
  categories: { id: string; name: string; sortOrder: number; isActive: boolean }[];
  services: Array<{
    id: string; name: string; description: string; imageUrl: string | null; durationMinutes: number;
    priceCents: number; priceType: 'FIXED' | 'STARTING_AT' | 'ESTIMATE' | 'CONFIRM'; categoryId: string;
    isActive: boolean; sortOrder: number; barberIds: string[];
  }>;
  barbers: Array<{
    id: string; displayName: string; email: string | null; phone: string | null; photoUrl: string | null;
    bio: string | null; isActive: boolean; serviceIds: string[];
  }>;
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
