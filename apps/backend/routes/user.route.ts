import type { Env } from "../type/env";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { getPrisma } from '../clients/prismaClient';
import { Context } from "hono";
import { signinInput, signupInput } from "@akashthakur2701/zod";
import { hashPassword, verifyPassword, validatePassword } from '../utils/auth';
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
  }
})

export default userRouter;