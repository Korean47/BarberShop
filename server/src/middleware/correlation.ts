import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const validCorrelationId = /^[a-zA-Z0-9._:-]{8,80}$/;

export function correlationId(req: Request, res: Response, next: NextFunction) {
  const supplied = req.header('x-correlation-id');
  req.correlationId = supplied && validCorrelationId.test(supplied) ? supplied : randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
}
