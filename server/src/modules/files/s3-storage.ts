import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { env } from '../../config/env.js';
import type { FileStorage, StoredFileInput } from './storage.js';

export class S3FileStorage implements FileStorage {
  private readonly client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
  });

  async put(input: StoredFileInput) {
    await this.client.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      ServerSideEncryption: 'AES256',
    }));
  }

  async get(key: string) {
    const object = await this.client.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
    const bytes = await object.Body?.transformToByteArray();
    if (!bytes) throw new Error('Storage returned an empty object');
    return { body: Buffer.from(bytes), contentType: object.ContentType ?? 'application/octet-stream' };
  }

  async remove(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  }
}
