import { prisma } from '../utils/prisma.js';

export async function getAllBarbers() {
  return prisma.barber.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getBarberById(id: string) {
  return prisma.barber.findUnique({ where: { id } });
}
