import { Context } from 'hono';
import { verify } from 'hono/jwt';
import type { Env } from '../type/env';

type JwtPayload = {
  id: string;
};

type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;

export const authMiddleware = async (c: AppContext, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      c.status(401);
      return c.json({ 
        success: false,
        message: 'Authorization header missing or malformed',
        error: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      c.status(401);
      return c.json({ 
        success: false,
        message: 'Token not provided',
        error: 'MISSING_TOKEN'
      });
    }

    const payload = await verify(token, c.env.JWT_SECRET) as JwtPayload;
    
    if (!payload || !payload.id) {
      c.status(401);
      return c.json({ 
        success: false,
        message: 'Invalid token payload',
        error: 'INVALID_TOKEN'
      });
    }

    c.set('userId', payload.id);
    await next();
  } catch (error) {
    console.error('JWT verification error:', error);
    c.status(401);
    return c.json({ 
      success: false,
      message: 'Invalid or expired token',
      error: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};
