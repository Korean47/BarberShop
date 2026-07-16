import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: 'La ruta solicitada no existe' },
    correlationId: req.correlationId,
  });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Revisa los datos marcados e inténtalo de nuevo',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      correlationId: req.correlationId,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: { code: error.code, message: error.message, details: error.details },
      correlationId: req.correlationId,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002' || error.code === 'P2034') {
      res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'La información cambió mientras realizabas la operación. Actualiza e inténtalo de nuevo.',
        },
        correlationId: req.correlationId,
      });
      return;
    }
  }

  logger.error('Unhandled request error', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    error: error instanceof Error ? error.message : 'Unknown error',
  });

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'No pudimos completar la operación' },
    correlationId: req.correlationId,
  });
}
