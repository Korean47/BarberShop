import type { Request } from 'express';
import { prisma } from '../../utils/prisma.js';
import { logger } from '../../shared/logger.js';

interface AuditInput {
  action: string;
  resourceType: string;
  resourceId?: string;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  context?: Record<string, unknown>;
  tenantId?: string | null;
  actorId?: string | null;
}

export async function recordAudit(req: Request, input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId ?? req.tenant?.id ?? null,
        actorId: input.actorId ?? req.auth?.userId ?? null,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        result: input.result,
        correlationId: req.correlationId,
        ipAddress: req.ip,
        context: input.context ? JSON.stringify(input.context) : undefined,
      },
    });
  } catch (error) {
    logger.error('Audit log write failed', {
      correlationId: req.correlationId,
      action: input.action,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
