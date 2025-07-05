import { Hono } from 'hono'
import { cors } from 'hono/cors';
import type { Env } from '../type/env';
import userRouter from '../routes/user.route';
import blogRouter from '../routes/blog.route';
import { errorHandler } from '../middleware/error.middleware';

const app = new Hono<{ Bindings: Env }>();


app.use('*', errorHandler);


app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], 
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'GitWrite API is running successfully',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.route('/api/v1/user', userRouter);
app.route('/api/v1/blog', blogRouter);







export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
