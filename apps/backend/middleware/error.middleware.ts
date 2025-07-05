import { Hono } from 'hono';
import { Context } from 'hono';

export const errorHandler = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.error('Unhandled error in route:', err);
    c.status(500);
    c.json({ message: 'Internal Server Error', error: err instanceof Error ? err.message : 'Unknown error' });
  }
};


export const unauthorizedHandler = (c: Context) => {
  c.status(401);
  c.json({ message: 'Unauthorized' });
};


export const createApp = () => {
  const app = new Hono();
  app.use(errorHandler);
  return app;
};
