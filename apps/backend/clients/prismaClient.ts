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

// Create a singleton pattern for Prisma client to avoid multiple instances
const prismaInstances = new WeakMap<Env, PrismaClient>();

export const getPrisma = (c: AppContext) => {
  if (!prismaInstances.has(c.env)) {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    prismaInstances.set(c.env, prisma);
  }
  return prismaInstances.get(c.env)!;
}
