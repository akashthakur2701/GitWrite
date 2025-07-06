import type { Context } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import type { Env } from '../type/env'

type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;

// Global Prisma client instance
let prisma: PrismaClient | null = null;

export const getPrisma = (c: AppContext) => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  }
  
  return prisma;
}

// Cleanup function for graceful shutdown
export const cleanupPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
