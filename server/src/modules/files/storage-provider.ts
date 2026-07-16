import { env } from '../../config/env.js';
import type { FileStorage } from './storage.js';
import { LocalFileStorage } from './local-storage.js';
import { S3FileStorage } from './s3-storage.js';

let storage: FileStorage | undefined;

export function getFileStorage() {
  if (!storage) {
    storage = env.FILE_STORAGE_PROVIDER === 's3'
      ? new S3FileStorage()
      : new LocalFileStorage(env.LOCAL_UPLOAD_DIR);
  }
  return storage;
}
