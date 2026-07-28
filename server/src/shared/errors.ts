export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);

export const unauthorized = (message = 'Inicia sesión para continuar') =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (code = 'FORBIDDEN', message = 'No tienes permiso para realizar esta acción') =>
  new AppError(403, code, message);

export const notFound = (resource = 'Recurso') =>
  new AppError(404, 'NOT_FOUND', `${resource} no encontrado`);

export const conflict = (code: string, message: string) =>
  new AppError(409, code, message);
