import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex');
}

export function hmacSha256(value: string | Buffer, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]+$/i.test(left) || !/^[a-f0-9]+$/i.test(right) || left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}
