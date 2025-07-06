import { z } from 'zod';


const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be less than 128 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, 
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');


const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');


const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .optional()
  .or(z.literal(''));


const titleSchema = z.string()
  .min(1, 'Title is required')
  .max(200, 'Title must be less than 200 characters')
  .trim();


const contentSchema = z.string()
  .min(1, 'Content is required')
  .max(50000, 'Content must be less than 50,000 characters');


const uuidSchema = z.string()
  .uuid('Invalid ID format');

export const signupInput = z.object({
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema
});

export const signinInput = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const postInput = z.object({
  title: titleSchema,
  content: contentSchema,
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  categoryId: uuidSchema.optional(),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional()
});

export const updatePostInput = z.object({
  title: titleSchema,
  content: contentSchema,
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
  categoryId: uuidSchema.optional(),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional(),
  id: uuidSchema
});

// User profile schemas
export const updateProfileInput = z.object({
  name: nameSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  hobby: z.string().max(100, 'Hobby must be less than 100 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional()
});

// Comment schemas
export const createCommentInput = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
  postId: uuidSchema,
  parentId: uuidSchema.optional()
});

// Category schemas
export const createCategoryInput = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional()
});

// Search and filter schemas
export const searchInput = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  sortBy: z.enum(['recent', 'popular', 'trending', 'oldest']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional()
});

export type signinInputType = z.infer<typeof signinInput>
export type signupInputType = z.infer<typeof signupInput>
export type postInputType = z.infer<typeof postInput>
export type updatePostInputType = z.infer<typeof updatePostInput>
export type updateProfileInputType = z.infer<typeof updateProfileInput>
export type createCommentInputType = z.infer<typeof createCommentInput>
export type createCategoryInputType = z.infer<typeof createCategoryInput>
export type searchInputType = z.infer<typeof searchInput>
