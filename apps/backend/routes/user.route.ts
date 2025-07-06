import type { Env } from "../type/env";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { getPrisma } from '../clients/prismaClient';
import { Context } from "hono";
import { signinInput, signupInput, updateProfileInput } from "@akashthakur2701/zod";
import { hashPassword, verifyPassword, validatePassword } from '../utils/auth';
import { authMiddleware } from '../middleware/auth.middleware';
const userRouter = new Hono<{Bindings : Env}>();

type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;

userRouter.post('/signup', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const body = await c.req.json();
    
    // Validate input with Zod
    const result = signupInput.safeParse(body);
    if (!result.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }
    
    const { email, password, name } = result.data;
    
    // Additional password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      c.status(400);
      return c.json({
        success: false,
        message: "Password validation failed",
        errors: passwordValidation.errors
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      c.status(409);
      return c.json({
        success: false,
        message: "User with this email already exists",
        error: "USER_EXISTS"
      });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });
    
    // Generate JWT token
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    
    return c.json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error during signup",
      error: "SIGNUP_FAILED"
    });
  }
})





userRouter.post('/signin', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const body = await c.req.json();
    
    // Validate input with Zod
    const result = signinInput.safeParse(body);
    if (!result.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }
    
    const { email, password } = result.data;
    
    // Find user by email only
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      c.status(401);
      return c.json({
        success: false,
        message: "Invalid credentials",
        error: "INVALID_CREDENTIALS"
      });
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      c.status(401);
      return c.json({
        success: false,
        message: "Invalid credentials",
        error: "INVALID_CREDENTIALS"
      });
    }
    
    // Generate JWT token
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    
    return c.json({
      success: true,
      message: "Sign in successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    });
    
  } catch (error) {
    console.error('Signin error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error during signin",
      error: "SIGNIN_FAILED"
    });
  }})


// Apply authentication middleware to protected routes
userRouter.use('/profile', authMiddleware);
userRouter.use('/stats', authMiddleware);

userRouter.get('/profile', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.get('userId');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        hobby: true,
        avatar: true,
        rating: true,
        totalViews: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      c.status(404);
      return c.json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    return c.json({
      success: true,
      message: "User profile fetched successfully",
      data: user
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching profile",
      error: "PROFILE_FETCH_FAILED"
    });
  }
});

userRouter.put('/profile', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.get('userId');
    const input = await c.req.json();
    const validation = updateProfileInput.safeParse(input);

    if (!validation.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        hobby: true,
        avatar: true,
        rating: true,
        totalViews: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    return c.json({
      success: true,
      message: "User profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while updating profile",
      error: "PROFILE_UPDATE_FAILED"
    });
  }

});

userRouter.get('/stats', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.get('userId');

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        title: true,
        views: true,
        likesCount: true
      },
      orderBy: { views: 'desc' }
    });

    const totalViews = posts.reduce((acc, post) => acc + post.views, 0);
    const totalLikes = posts.reduce((acc, post) => acc + post.likesCount, 0);
    const totalComments = await prisma.comment.count({
      where: { authorId: userId }
    });

    const stats = {
      totalPosts: posts.length,
      totalViews,
      totalLikes,
      totalComments,
      avgRating: parseFloat((totalLikes / posts.length || 0).toFixed(1)),
      monthlyViews: [120, 150, 110, 80, 90, 140, 160],
      popularPosts: posts.slice(0, 5)
    };

    return c.json({
      success: true,
      message: "User stats fetched successfully",
      data: stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching stats",
      error: "STATS_FETCH_FAILED"
    });
  }
});

// Get public user profile (no auth required)
userRouter.get('/public/:userId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.req.param('userId');
    
    // Validate user ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid user ID format",
        error: "INVALID_USER_ID"
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        hobby: true,
        avatar: true,
        rating: true,
        totalViews: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      c.status(404);
      return c.json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    // Get recent posts by this user
    const recentPosts = await prisma.post.findMany({
      where: { 
        authorId: userId,
        published: true 
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        slug: true,
        createdAt: true,
        views: true,
        likesCount: true,
        commentsCount: true,
        readTime: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return c.json({
      success: true,
      message: "Public user profile fetched successfully",
      data: {
        user,
        recentPosts
      }
    });
  } catch (error) {
    console.error('Public profile fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching public profile",
      error: "PUBLIC_PROFILE_FETCH_FAILED"
    });
  }
});

export default userRouter ;
