import { prisma } from '../../utils/prisma.js';

export async function releaseExpiredPaymentHolds(tenantId: string, now = new Date()) {
  const expired = await prisma.appointment.findMany({
    where: { tenantId, status: 'PENDING', holdExpiresAt: { lte: now } },
    select: { id: true },
  });
  if (!expired.length) return 0;
  const ids = expired.map(({ id }) => id);
  await prisma.$transaction([
    prisma.payment.updateMany({
      where: { appointmentId: { in: ids }, status: 'PENDING' },
      data: { status: 'CANCELLED' },
    }),
    prisma.appointment.updateMany({
      where: { id: { in: ids }, status: 'PENDING' },
      data: { status: 'CANCELLED', holdExpiresAt: null, version: { increment: 1 } },
    }),
  ]);
  return ids.length;
}
