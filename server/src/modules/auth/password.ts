import { compare, hash } from 'bcryptjs';

const HASH_ROUNDS = 12;
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5JMzJ..9w7g7G7fG1JrR8qvY3Yv7qYgR5C';

export function hashPassword(password: string) {
  return hash(password, HASH_ROUNDS);
}

export function verifyPassword(password: string, passwordHash?: string) {
  return compare(password, passwordHash ?? DUMMY_HASH);
}
