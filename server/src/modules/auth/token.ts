import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface SessionClaims extends jwt.JwtPayload {
  sub: string;
  tenantId: string | null;
  platform: boolean;
  csrf: string;
}

export function signSessionToken(claims: Omit<SessionClaims, 'iat' | 'exp' | 'iss' | 'aud'>) {
  return jwt.sign(claims, env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: `${env.SESSION_TTL_MINUTES}m`,
  });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }) as SessionClaims;
}
