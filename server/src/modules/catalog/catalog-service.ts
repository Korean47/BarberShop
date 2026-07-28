import { prisma } from '../../utils/prisma.js';

const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export async function getTenantContext(tenantId: string) {
  return prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      slug: true,
      name: true,
      timezone: true,
      currency: true,
      locale: true,
      contactEmail: true,
      contactPhone: true,
      branding: true,
      locations: {
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          phone: true,
          mapsUrl: true,
          isDefault: true,
          businessSchedules: { orderBy: { dayOfWeek: 'asc' } },
          scheduleExceptions: {
            where: { date: { gte: new Date() } },
            orderBy: { date: 'asc' },
            take: 180,
          },
        },
      },
      settings: { select: { key: true, value: true } },
    },
  });
}

export async function listPublicBarbers(tenantId: string) {
  const barbers = await prisma.barberProfile.findMany({
    where: { tenantId, isActive: true },
    include: {
      specialties: { include: { specialty: true } },
      services: { select: { serviceId: true } },
      schedules: { where: { isWorking: true }, orderBy: { dayOfWeek: 'asc' } },
    },
    orderBy: { displayName: 'asc' },
  });

  return barbers.map((barber) => {
    const schedule = Object.fromEntries(
      barber.schedules.map((item) => [
        dayNames[item.dayOfWeek],
        {
          start: `${Math.floor(item.startMinute / 60).toString().padStart(2, '0')}:${(item.startMinute % 60).toString().padStart(2, '0')}`,
          end: `${Math.floor(item.endMinute / 60).toString().padStart(2, '0')}:${(item.endMinute % 60).toString().padStart(2, '0')}`,
        },
      ]),
    );
    return {
      id: barber.id,
      name: barber.displayName,
      email: barber.email ?? '',
      phone: barber.phone ?? '',
      photo: barber.photoUrl ?? '',
      bio: barber.bio ?? '',
      specialties: JSON.stringify(barber.specialties.map(({ specialty }) => specialty.name)),
      workSchedule: JSON.stringify(schedule),
      serviceIds: barber.services.map(({ serviceId }) => serviceId),
      isActive: barber.isActive,
      createdAt: barber.createdAt.toISOString(),
      updatedAt: barber.updatedAt.toISOString(),
    };
  });
}

export async function listPublicServices(tenantId: string) {
  const services = await prisma.service.findMany({
    where: { tenantId, isActive: true, category: { isActive: true } },
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }, { priceCents: 'asc' }],
  });

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    imageUrl: service.imageUrl,
    duration: service.durationMinutes,
    bufferBeforeMinutes: service.bufferBeforeMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    price: service.priceCents / 100,
    priceCents: service.priceCents,
    priceType: service.priceType.toLowerCase(),
    category: service.category.name,
    categoryId: service.categoryId,
    isActive: service.isActive,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  }));
}
