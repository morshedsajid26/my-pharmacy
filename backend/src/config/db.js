import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Retrieve database URL with fallback for Vercel Storage environment variable names
const connectionString =
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost:5432'))
    ? process.env.DATABASE_URL
    : (process.env.STORAGE_PRISMA_DATABASE_URL ||
       process.env.STORAGE_POSTGRES_URL ||
       process.env.POSTGRES_PRISMA_URL ||
       process.env.POSTGRES_URL ||
       process.env.DATABASE_URL);

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: connectionString ? { db: { url: connectionString } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
