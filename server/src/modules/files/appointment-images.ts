import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { prisma } from '../../utils/prisma.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { findByManagementToken } from '../appointments/booking-service.js';
import { managementToken } from '../appointments/booking-controller.js';
import { getFileStorage } from './storage-provider.js';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const referenceImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
}).single('referenceImage');

export async function uploadReferenceImage(req: Request, res: Response, next: NextFunction) {
  let storageKey: string | undefined;
  try {
    const tenant = requireTenant(req);
    const appointment = await findByManagementToken(tenant.id, managementToken(req));
    if (!req.file) throw badRequest('FILE_REQUIRED', 'Selecciona una imagen');
    if (appointment.referenceImages.length >= 3) {
      throw badRequest('FILE_LIMIT', 'Puedes adjuntar hasta tres imágenes');
    }

    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (!detected || !allowedMimeTypes.has(detected.mime)) {
      throw badRequest('INVALID_FILE_TYPE', 'Usa una imagen JPG, PNG o WebP');
    }

    const processed = await sharp(req.file.buffer, { failOn: 'warning', limitInputPixels: 25_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    storageKey = `${tenant.id}/${appointment.id}/${randomUUID()}.webp`;
    await getFileStorage().put({ key: storageKey, body: processed.data, contentType: 'image/webp' });
    const image = await prisma.appointmentReferenceImage.create({
      data: {
        appointmentId: appointment.id,
        storageKey,
        originalName: req.file.originalname.slice(0, 255),
        mimeType: 'image/webp',
        byteSize: processed.info.size,
        width: processed.info.width,
        height: processed.info.height,
      },
      select: { id: true, originalName: true, mimeType: true, byteSize: true, width: true, height: true },
    });
    res.status(201).json(image);
  } catch (error) {
    if (storageKey) await getFileStorage().remove(storageKey).catch(() => undefined);
    next(error);
  }
}

export async function downloadReferenceImage(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const appointment = await findByManagementToken(tenant.id, managementToken(req));
    const image = await prisma.appointmentReferenceImage.findFirst({
      where: { id: req.params.imageId as string, appointmentId: appointment.id },
    });
    if (!image) throw notFound('Imagen');
    const stored = await getFileStorage().get(image.storageKey);
    res.setHeader('content-type', stored.contentType);
    res.setHeader('content-length', stored.body.length);
    res.setHeader('cache-control', 'private, max-age=300');
    res.setHeader('content-disposition', 'inline');
    res.send(stored.body);
  } catch (error) {
    next(error);
  }
}
