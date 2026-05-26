import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barber.deleteMany();

  // --- Barbers ---
  const barbers = await Promise.all([
    prisma.barber.create({
      data: {
        id: 'barber-1',
        name: 'Marcus Chen',
        email: 'marcus@bladesbarber.com',
        phone: '(555) 101-0001',
        photo: '/images/barber-1.png',
        bio: 'With over 12 years of experience, Marcus specializes in precision fades and modern styles. Known for his attention to detail and ability to create sharp, clean looks.',
        specialties: JSON.stringify(['Precision Fades', 'Modern Styles', 'Hair Design']),
        workSchedule: JSON.stringify({
          monday: { start: '09:00', end: '18:00' },
          tuesday: { start: '09:00', end: '18:00' },
          wednesday: { start: '09:00', end: '18:00' },
          thursday: { start: '09:00', end: '20:00' },
          friday: { start: '09:00', end: '20:00' },
          saturday: { start: '10:00', end: '16:00' },
        }),
      },
    }),
    prisma.barber.create({
      data: {
        id: 'barber-2',
        name: 'Diego Ramirez',
        email: 'diego@bladesbarber.com',
        phone: '(555) 101-0002',
        photo: '/images/barber-2.png',
        bio: 'Diego brings fresh energy and cutting-edge techniques from his training in Los Angeles. He excels at textured crops, beard sculpting, and trendy styles.',
        specialties: JSON.stringify(['Textured Crops', 'Beard Sculpting', 'Trendy Styles']),
        workSchedule: JSON.stringify({
          monday: { start: '10:00', end: '19:00' },
          tuesday: { start: '10:00', end: '19:00' },
          wednesday: { start: '10:00', end: '19:00' },
          thursday: { start: '10:00', end: '19:00' },
          friday: { start: '10:00', end: '20:00' },
          saturday: { start: '09:00', end: '17:00' },
        }),
      },
    }),
    prisma.barber.create({
      data: {
        id: 'barber-3',
        name: 'Jamal Williams',
        email: 'jamal@bladesbarber.com',
        phone: '(555) 101-0003',
        photo: '/images/barber-3.png',
        bio: 'Jamal is a master of classic barbering with a modern twist. His hot towel shaves and beard grooming are legendary. 15 years in the game.',
        specialties: JSON.stringify(['Classic Cuts', 'Hot Towel Shaves', 'Beard Grooming']),
        workSchedule: JSON.stringify({
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '19:00' },
          saturday: { start: '09:00', end: '17:00' },
          sunday: { start: '10:00', end: '15:00' },
        }),
      },
    }),
    prisma.barber.create({
      data: {
        id: 'barber-4',
        name: 'Tony Moretti',
        email: 'tony@bladesbarber.com',
        phone: '(555) 101-0004',
        photo: '/images/barber-4.png',
        bio: 'Tony brings old-world Italian craftsmanship to every cut. With 20+ years of experience, he is the go-to for classic gentleman styles and premium grooming.',
        specialties: JSON.stringify(['Classic Gentleman', 'Straight Razor', 'Premium Grooming']),
        workSchedule: JSON.stringify({
          monday: { start: '08:00', end: '16:00' },
          tuesday: { start: '08:00', end: '16:00' },
          wednesday: { start: '08:00', end: '16:00' },
          thursday: { start: '08:00', end: '16:00' },
          friday: { start: '08:00', end: '16:00' },
          saturday: { start: '09:00', end: '14:00' },
        }),
      },
    }),
  ]);

  // --- Services ---
  const services = await Promise.all([
    prisma.service.create({
      data: {
        id: 'service-1',
        name: 'Classic Haircut',
        description: 'Traditional haircut with clippers and scissors. Includes consultation, shampoo, and styling.',
        duration: 30,
        price: 35,
        category: 'haircut',
      },
    }),
    prisma.service.create({
      data: {
        id: 'service-2',
        name: 'Signature Fade',
        description: 'Precision skin fade or taper fade with detailed line work and edge-up.',
        duration: 45,
        price: 45,
        category: 'haircut',
      },
    }),
    prisma.service.create({
      data: {
        id: 'service-3',
        name: 'Beard Trim & Shape',
        description: 'Expert beard trimming, shaping, and conditioning with hot towel treatment.',
        duration: 20,
        price: 25,
        category: 'beard',
      },
    }),
    prisma.service.create({
      data: {
        id: 'service-4',
        name: 'Hot Towel Shave',
        description: 'Luxurious straight razor shave with hot towel prep, premium shaving cream, and aftershave balm.',
        duration: 40,
        price: 40,
        category: 'shave',
      },
    }),
    prisma.service.create({
      data: {
        id: 'service-5',
        name: 'Haircut + Beard Combo',
        description: 'Complete grooming package: precision haircut combined with beard trim and shaping.',
        duration: 50,
        price: 55,
        category: 'combo',
      },
    }),
    prisma.service.create({
      data: {
        id: 'service-6',
        name: 'The Premium Experience',
        description: 'Our signature service: haircut, hot towel shave, beard grooming, scalp massage, and styling. The ultimate grooming experience.',
        duration: 75,
        price: 85,
        category: 'premium',
      },
    }),
  ]);

  // --- Customers ---
  const customers = await Promise.all([
    prisma.customer.create({
      data: { id: 'cust-1', name: 'Alex Johnson', email: 'alex@email.com', phone: '(555) 200-0001' },
    }),
    prisma.customer.create({
      data: { id: 'cust-2', name: 'Ryan Park', email: 'ryan@email.com', phone: '(555) 200-0002' },
    }),
    prisma.customer.create({
      data: { id: 'cust-3', name: 'Chris Davis', email: 'chris@email.com', phone: '(555) 200-0003' },
    }),
    prisma.customer.create({
      data: { id: 'cust-4', name: 'Mike Torres', email: 'mike@email.com', phone: '(555) 200-0004' },
    }),
    prisma.customer.create({
      data: { id: 'cust-5', name: 'Sam Wilson', email: 'sam@email.com', phone: '(555) 200-0005' },
    }),
  ]);

  // --- Appointments (spread across this week and next) ---
  const today = new Date();
  const getDate = (daysOffset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  await Promise.all([
    // Today
    prisma.appointment.create({
      data: {
        date: getDate(0),
        startTime: '09:00',
        endTime: '09:30',
        status: 'confirmed',
        barberId: 'barber-1',
        serviceId: 'service-1',
        customerId: 'cust-1',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(0),
        startTime: '10:00',
        endTime: '10:45',
        status: 'confirmed',
        barberId: 'barber-1',
        serviceId: 'service-2',
        customerId: 'cust-2',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(0),
        startTime: '11:00',
        endTime: '11:40',
        status: 'confirmed',
        barberId: 'barber-2',
        serviceId: 'service-4',
        customerId: 'cust-3',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(0),
        startTime: '14:00',
        endTime: '14:50',
        status: 'pending',
        barberId: 'barber-3',
        serviceId: 'service-5',
        customerId: 'cust-4',
      },
    }),
    // Tomorrow
    prisma.appointment.create({
      data: {
        date: getDate(1),
        startTime: '09:30',
        endTime: '10:00',
        status: 'confirmed',
        barberId: 'barber-4',
        serviceId: 'service-1',
        customerId: 'cust-5',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(1),
        startTime: '11:00',
        endTime: '12:15',
        status: 'confirmed',
        barberId: 'barber-2',
        serviceId: 'service-6',
        customerId: 'cust-1',
      },
    }),
    // Day after tomorrow
    prisma.appointment.create({
      data: {
        date: getDate(2),
        startTime: '13:00',
        endTime: '13:30',
        status: 'confirmed',
        barberId: 'barber-1',
        serviceId: 'service-1',
        customerId: 'cust-3',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(2),
        startTime: '15:00',
        endTime: '15:20',
        status: 'confirmed',
        barberId: 'barber-3',
        serviceId: 'service-3',
        customerId: 'cust-2',
      },
    }),
    // 3 days out
    prisma.appointment.create({
      data: {
        date: getDate(3),
        startTime: '10:00',
        endTime: '10:45',
        status: 'pending',
        barberId: 'barber-2',
        serviceId: 'service-2',
        customerId: 'cust-4',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(3),
        startTime: '14:00',
        endTime: '15:15',
        status: 'confirmed',
        barberId: 'barber-4',
        serviceId: 'service-6',
        customerId: 'cust-5',
      },
    }),
    // 5 days out
    prisma.appointment.create({
      data: {
        date: getDate(5),
        startTime: '09:00',
        endTime: '09:50',
        status: 'confirmed',
        barberId: 'barber-1',
        serviceId: 'service-5',
        customerId: 'cust-1',
      },
    }),
    prisma.appointment.create({
      data: {
        date: getDate(5),
        startTime: '11:00',
        endTime: '11:30',
        status: 'cancelled',
        barberId: 'barber-3',
        serviceId: 'service-1',
        customerId: 'cust-2',
        notes: 'Customer cancelled — rescheduling next week',
      },
    }),
  ]);

  console.log('✅ Seed complete!');
  console.log(`   ${barbers.length} barbers`);
  console.log(`   ${services.length} services`);
  console.log(`   ${customers.length} customers`);
  console.log(`   12 appointments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
