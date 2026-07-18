import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const ids = {
  tenant: '00000000-0000-4000-8000-000000000001',
  location: '00000000-0000-4000-8000-000000000002',
  plan: '00000000-0000-4000-8000-000000000003',
  subscription: '00000000-0000-4000-8000-000000000004',
  owner: '00000000-0000-4000-8000-000000000005',
  ownerRole: '00000000-0000-4000-8000-000000000006',
  receptionistRole: '00000000-0000-4000-8000-000000000007',
  platformAdmin: '00000000-0000-4000-8000-000000000008',
};

const barbers = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    displayName: 'Luis Mendoza',
    email: 'lucho@blades.mx',
    phone: '+526621010001',
    photoUrl: '/images/barber-1.webp',
    bio: 'Realiza degradados limpios y cortes prácticos, considerando el tipo de cabello y el mantenimiento diario.',
    specialties: ['Degradados', 'Diseño capilar'],
    startMinute: 9 * 60,
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    displayName: 'Diego Ramírez',
    email: 'diego@blades.mx',
    phone: '+526621010002',
    photoUrl: '/images/barber-2.webp',
    bio: 'Trabaja cabello con textura, cortes contemporáneos y arreglo de barba.',
    specialties: ['Texturas', 'Diseño de barba'],
    startMinute: 10 * 60,
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    displayName: 'Iván Soto',
    email: 'ivan@blades.mx',
    phone: '+526621010003',
    photoUrl: '/images/barber-3.webp',
    bio: 'Atiende cortes clásicos, barba y arreglos sencillos de mantenimiento.',
    specialties: ['Corte clásico', 'Barba'],
    startMinute: 9 * 60,
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    displayName: 'Antonio Valdez',
    email: 'tono@blades.mx',
    phone: '+526621010004',
    photoUrl: '/images/barber-4.webp',
    bio: 'Atiende cortes con tijera y máquina para personas adultas, jóvenes y niñas o niños.',
    specialties: ['Corte familiar', 'Tijera'],
    startMinute: 8 * 60,
  },
];

const services = [
  ['20000000-0000-4000-8000-000000000001', 'Corte clásico', 'Máquina y tijera para un corte limpio y fácil de peinar.', 30, 22000, 'hair', '/images/corte-clasico.webp'],
  ['20000000-0000-4000-8000-000000000002', 'Degradado', 'Desvanecido bajo o medio, contornos limpios y acabado con textura.', 40, 26000, 'hair', '/images/degradado.webp'],
  ['20000000-0000-4000-8000-000000000003', 'Corte infantil', 'Corte cómodo y con paciencia para niñas y niños de hasta 12 años.', 30, 18000, 'hair', '/images/corte-infantil.webp'],
  ['20000000-0000-4000-8000-000000000004', 'Barba', 'Recorte, forma y contornos para dejar la barba pareja.', 20, 14000, 'beard', '/images/barba.webp'],
  ['20000000-0000-4000-8000-000000000005', 'Corte y barba', 'Corte completo más arreglo y contorno de barba.', 50, 29000, 'special', '/images/corte-barba.webp'],
  ['20000000-0000-4000-8000-000000000006', 'Corte personalizado', 'Trae o sube una referencia. El precio se confirma contigo antes de empezar.', 45, 26000, 'special', '/images/corte-personalizado.webp'],
] as const;

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_OWNER_PASSWORD) {
    throw new Error('SEED_OWNER_PASSWORD is required in production');
  }
  const ownerPassword = process.env.SEED_OWNER_PASSWORD ?? 'ChangeMe!2026';
  const platformPassword = process.env.SEED_PLATFORM_PASSWORD ?? 'ChangeMePlatform!2026';

  await prisma.subscriptionPlan.upsert({
    where: { id: ids.plan },
    update: { name: 'Profesional', priceCents: 129900, graceDays: 5 },
    create: {
      id: ids.plan,
      key: 'professional-monthly',
      name: 'Profesional',
      description: 'Agenda, equipo, pagos, identidad y reportes para una barbería.',
      priceCents: 129900,
      graceDays: 5,
    },
  });

  await prisma.tenant.upsert({
    where: { id: ids.tenant },
    update: { name: 'Blades Barbería', contactEmail: 'hola@blades.mx', contactPhone: '+526621234567' },
    create: {
      id: ids.tenant,
      slug: 'blades',
      name: 'Blades Barbería',
      legalName: 'Blades Barbería S. de R.L.',
      timezone: 'America/Hermosillo',
      currency: 'MXN',
      locale: 'es-MX',
      contactEmail: 'hola@blades.mx',
      contactPhone: '+526621234567',
    },
  });

  await prisma.tenantBranding.upsert({
    where: { tenantId: ids.tenant },
      update: {
        heroImageUrl: '/images/hero-local.webp',
        heroVideoUrl: '/videos/Horizontal.mp4',
        heroMobileVideoUrl: '/videos/Vertical.mp4',
        heroPosterUrl: '/images/hero-local.webp',
      heroFallbackUrls: JSON.stringify(['/images/hero-local.webp', '/images/corte-clasico.webp', '/images/barba.webp']),
      heroTitle: 'Cortes y barba, con tiempo para hacerlo bien.',
      heroSubtitle: 'Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos.',
      shopImageUrl: '/images/hero-local.webp',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Blvd.%20Morelos%20123%2C%20Hermosillo%2C%20Sonora',
      whatsappUrl: 'https://wa.me/526621234567',
      primaryColor: '#183A44',
      secondaryColor: '#17191C',
      accentColor: '#B8543C',
      backgroundColor: '#F5F2EB',
      fontFamily: 'contemporary',
      publishedAt: new Date(),
    },
      create: {
        tenantId: ids.tenant,
        heroImageUrl: '/images/hero-local.webp',
        heroVideoUrl: '/videos/Horizontal.mp4',
        heroMobileVideoUrl: '/videos/Vertical.mp4',
        heroPosterUrl: '/images/hero-local.webp',
      heroFallbackUrls: JSON.stringify(['/images/hero-local.webp', '/images/corte-clasico.webp', '/images/barba.webp']),
      heroTitle: 'Cortes y barba, con tiempo para hacerlo bien.',
      heroSubtitle: 'Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos.',
      shopImageUrl: '/images/hero-local.webp',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Blvd.%20Morelos%20123%2C%20Hermosillo%2C%20Sonora',
      whatsappUrl: 'https://wa.me/526621234567',
      primaryColor: '#183A44',
      secondaryColor: '#17191C',
      accentColor: '#B8543C',
      backgroundColor: '#F5F2EB',
      fontFamily: 'contemporary',
      publishedAt: new Date(),
    },
  });

  await prisma.location.upsert({
    where: { id: ids.location },
    update: { mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Blvd.%20Morelos%20123%2C%20Hermosillo%2C%20Sonora' },
    create: {
      id: ids.location,
      tenantId: ids.tenant,
      name: 'Blades Morelos',
      slug: 'morelos',
      addressLine1: 'Blvd. Morelos 123',
      city: 'Hermosillo',
      state: 'Sonora',
      postalCode: '83100',
      phone: '+526621234567',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Blvd.%20Morelos%20123%2C%20Hermosillo%2C%20Sonora',
      isDefault: true,
    },
  });

  await prisma.subscription.upsert({
    where: { tenantId: ids.tenant },
    update: {},
    create: {
      id: ids.subscription,
      tenantId: ids.tenant,
      planId: ids.plan,
      provider: 'mock',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const settings = {
    'booking.slotIntervalMinutes': '15',
    'booking.minimumNoticeMinutes': '120',
    'booking.maxAdvanceDays': '90',
    'booking.cancellationHours': '2',
    'booking.holdMinutes': '30',
    'booking.allowCash': 'true',
    'booking.allowOnline': 'true',
    'privacy.customerRetentionDays': '730',
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId: ids.tenant, key } },
      update: { value },
      create: { tenantId: ids.tenant, key, value },
    });
  }

  for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek += 1) {
    await prisma.businessSchedule.upsert({
      where: { locationId_dayOfWeek: { locationId: ids.location, dayOfWeek } },
      update: {},
      create: {
        locationId: ids.location,
        dayOfWeek,
        startMinute: dayOfWeek === 6 ? 9 * 60 : 8 * 60,
        endMinute: dayOfWeek === 6 ? 17 * 60 : 20 * 60,
      },
    });
  }

  const categories = {
    hair: '30000000-0000-4000-8000-000000000001',
    beard: '30000000-0000-4000-8000-000000000002',
    special: '30000000-0000-4000-8000-000000000003',
  };
  for (const [index, [key, name]] of Object.entries({ hair: 'Cabello', beard: 'Barba', special: 'Especiales' }).entries()) {
    await prisma.serviceCategory.upsert({
      where: { id: categories[key as keyof typeof categories] },
      update: { name, sortOrder: index },
      create: { id: categories[key as keyof typeof categories], tenantId: ids.tenant, name, sortOrder: index },
    });
  }

  for (const [index, [id, name, description, durationMinutes, priceCents, category, imageUrl]] of services.entries()) {
    await prisma.service.upsert({
      where: { id },
      update: { categoryId: categories[category], name, description, durationMinutes, priceCents, imageUrl, sortOrder: index, priceType: name === 'Corte personalizado' ? 'ESTIMATE' : 'FIXED' },
      create: {
        id,
        tenantId: ids.tenant,
        categoryId: categories[category],
        name,
        description,
        imageUrl,
        durationMinutes,
        priceCents,
        priceType: name === 'Corte personalizado' ? 'ESTIMATE' : 'FIXED',
        sortOrder: index,
      },
    });
  }

  for (const barber of barbers) {
    await prisma.barberProfile.upsert({
      where: { id: barber.id },
      update: { displayName: barber.displayName, email: barber.email, phone: barber.phone, photoUrl: barber.photoUrl, bio: barber.bio },
      create: {
        id: barber.id,
        tenantId: ids.tenant,
        displayName: barber.displayName,
        email: barber.email,
        phone: barber.phone,
        photoUrl: barber.photoUrl,
        bio: barber.bio,
      },
    });
    await prisma.barberSpecialtyAssignment.deleteMany({ where: { barberId: barber.id } });
    for (const name of barber.specialties) {
      const specialty = await prisma.barberSpecialty.upsert({
        where: { tenantId_name: { tenantId: ids.tenant, name } },
        update: {},
        create: { tenantId: ids.tenant, name },
      });
      await prisma.barberSpecialtyAssignment.upsert({
        where: { barberId_specialtyId: { barberId: barber.id, specialtyId: specialty.id } },
        update: {},
        create: { barberId: barber.id, specialtyId: specialty.id },
      });
    }
    for (const [serviceId] of services) {
      await prisma.barberService.upsert({
        where: { barberId_serviceId: { barberId: barber.id, serviceId } },
        update: {},
        create: { barberId: barber.id, serviceId },
      });
    }
    for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek += 1) {
      await prisma.barberSchedule.upsert({
        where: { barberId_locationId_dayOfWeek: { barberId: barber.id, locationId: ids.location, dayOfWeek } },
        update: {},
        create: {
          barberId: barber.id,
          locationId: ids.location,
          dayOfWeek,
          startMinute: barber.startMinute,
          endMinute: dayOfWeek === 6 ? 16 * 60 : 19 * 60,
        },
      });
    }
  }

  const permissionDefinitions = {
    'appointments:read': 'Consultar citas y agenda',
    'appointments:write': 'Modificar citas y estados',
    'customers:read': 'Consultar clientes',
    'customers:write': 'Modificar clientes',
    'barbers:read': 'Consultar personal',
    'barbers:write': 'Administrar personal',
    'billing:read': 'Consultar facturación',
    'billing:write': 'Administrar facturación',
    'settings:read': 'Consultar configuración',
    'settings:write': 'Modificar configuración',
    'reports:read': 'Consultar reportes',
  };
  const permissionIds: string[] = [];
  for (const [key, description] of Object.entries(permissionDefinitions)) {
    const permission = await prisma.permission.upsert({
      where: { key }, update: { description }, create: { key, description },
    });
    permissionIds.push(permission.id);
  }

  await prisma.role.upsert({
    where: { id: ids.ownerRole },
    update: {},
    create: { id: ids.ownerRole, tenantId: ids.tenant, key: 'owner', name: 'Propietario', isSystem: true },
  });
  await prisma.role.upsert({
    where: { id: ids.receptionistRole },
    update: {},
    create: { id: ids.receptionistRole, tenantId: ids.tenant, key: 'receptionist', name: 'Recepción', isSystem: true },
  });
  for (const permissionId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: ids.ownerRole, permissionId } },
      update: {}, create: { roleId: ids.ownerRole, permissionId },
    });
  }

  await prisma.internalUser.upsert({
    where: { id: ids.owner },
    update: {},
    create: {
      id: ids.owner,
      tenantId: ids.tenant,
      email: 'owner@blades.mx',
      name: 'Alejandro Ruiz',
      passwordHash: await hash(ownerPassword, 12),
      roles: { create: { roleId: ids.ownerRole } },
    },
  });
  await prisma.internalUser.upsert({
    where: { id: ids.platformAdmin },
    update: {},
    create: {
      id: ids.platformAdmin,
      email: 'platform@barbershop.local',
      name: 'Platform Administrator',
      passwordHash: await hash(platformPassword, 12),
      isPlatformAdmin: true,
    },
  });

  console.info('Seed complete: tenant "blades" and owner account created.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
