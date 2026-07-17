import 'dotenv/config';
import { z } from 'zod';

const booleanFromString = z.preprocess(
  (value) => value === true || value === 'true',
  z.boolean(),
);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z
      .string()
      .min(1)
      .default('postgresql://barbershop:barbershop@localhost:5432/barbershop?schema=public'),
    PUBLIC_APP_URL: z.string().url().default('http://localhost:5173'),
    ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
    DEFAULT_TENANT_SLUG: z.string().regex(/^[a-z0-9-]+$/).default('blades'),
    JWT_SECRET: z.string().min(32).default('development-only-secret-change-me-123456789'),
    JWT_ISSUER: z.string().default('barbershop-api'),
    JWT_AUDIENCE: z.string().default('barbershop-admin'),
    SESSION_TTL_MINUTES: z.coerce.number().int().min(15).max(1440).default(480),
    PAYMENT_PROVIDER: z.enum(['disabled', 'mock', 'stripe']).default('disabled'),
    PAYMENT_WEBHOOK_SECRET: z
      .string()
      .min(24)
      .default('development-webhook-secret-change-me'),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    FILE_STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
    LOCAL_UPLOAD_DIR: z.string().default('.data/uploads'),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    TRUST_PROXY: booleanFromString.default(false),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === 'production') {
      if (env.JWT_SECRET.includes('development') || env.JWT_SECRET.includes('change-me')) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'JWT_SECRET must be replaced in production',
        });
      }
      if (env.PAYMENT_PROVIDER === 'mock') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['PAYMENT_PROVIDER'],
          message: 'The mock payment provider is forbidden in production',
        });
      }
      if (env.FILE_STORAGE_PROVIDER !== 's3') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['FILE_STORAGE_PROVIDER'],
          message: 'Production uploads require S3-compatible object storage',
        });
      }
    }

    if (env.FILE_STORAGE_PROVIDER === 's3') {
      for (const key of ['S3_REGION', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const) {
        if (!env[key]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required for S3 storage`,
          });
        }
      }
    }
    if (env.PAYMENT_PROVIDER === 'stripe' && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['STRIPE_SECRET_KEY'],
        message: 'Stripe secret and webhook keys are required when PAYMENT_PROVIDER=stripe',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = {
  ...parsed.data,
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
