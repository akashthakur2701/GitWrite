import { Hono } from 'hono'
import { cors } from 'hono/cors';
import type { Env } from '../type/env';
import userRouter from '../routes/user.route';
import blogRouter from '../routes/blog.route';
import { errorHandler } from '../middleware/error.middleware';
import likeRouter from '../routes/like.route';
import commentRouter from '../routes/comment.route';
import followRouter from '../routes/follow.route';
import searchRouter from '../routes/search.route';
import bookmarkRouter from '../routes/bookmark.route';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors()
);


// Error handler comes after CORS
app.use('*', errorHandler);

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
app.route('/api/v1/like', likeRouter);
app.route('/api/v1/comment', commentRouter);
app.route('/api/v1/follow', followRouter);
app.route('/api/v1/search', searchRouter);
app.route('/api/v1/bookmark', bookmarkRouter);







export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Validate environment variables
    if (!env.DATABASE_URL) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'DATABASE_URL environment variable is required' 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!env.JWT_SECRET) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'JWT_SECRET environment variable is required' 
        }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return app.fetch(request, env, ctx);
  },
};
