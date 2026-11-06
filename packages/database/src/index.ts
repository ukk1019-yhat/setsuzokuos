import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

let globalPrisma: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!globalPrisma) {
    globalPrisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return globalPrisma;
}

export const prisma = getPrismaClient();

