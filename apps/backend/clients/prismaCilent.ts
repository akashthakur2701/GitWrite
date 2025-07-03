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
export const getPrisma = (c: AppContext) => {
  return new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
}
