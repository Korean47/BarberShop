import { prisma } from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listServices() {
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new AppError(404, 'Service not found');
  return service;
}
