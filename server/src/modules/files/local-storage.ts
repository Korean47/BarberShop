import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from '../../shared/errors.js';
import type { FileStorage, StoredFileInput } from './storage.js';

export class LocalFileStorage implements FileStorage {
  private readonly root: string;

  constructor(directory: string) {
    this.root = path.resolve(process.cwd(), directory);
  }

  private resolveKey(key: string) {
    const target = path.resolve(this.root, key);
    if (!target.startsWith(`${this.root}${path.sep}`)) throw new Error('Unsafe storage key');
    return target;
  }

  async put(input: StoredFileInput) {
    const target = this.resolveKey(input.key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, input.body, { flag: 'wx' });
  }

  async get(key: string) {
    try {
      return { body: await readFile(this.resolveKey(key)), contentType: 'image/webp' };
    } catch {
      throw notFound('Imagen');
    }
  }

  async remove(key: string) {
    await rm(this.resolveKey(key), { force: true });
  }
}
