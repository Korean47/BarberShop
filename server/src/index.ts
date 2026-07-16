import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';
import { logger } from './shared/logger.js';

const server = createServer(createApp());

server.listen(env.PORT, () => {
  logger.info('API listening', { port: env.PORT, environment: env.NODE_ENV });
});

async function shutdown(signal: string) {
  logger.info('Shutting down', { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
