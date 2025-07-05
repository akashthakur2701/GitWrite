"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchInput = exports.createCategoryInput = exports.createCommentInput = exports.updateProfileInput = exports.updatePostInput = exports.postInput = exports.signinInput = exports.signupInput = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/, 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
const emailSchema = zod_1.z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters');
const nameSchema = zod_1.z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional();
const titleSchema = zod_1.z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim();
const contentSchema = zod_1.z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters');
const uuidSchema = zod_1.z.string()
    .uuid('Invalid ID format');
exports.signupInput = zod_1.z.object({
    email: emailSchema,
    name: nameSchema,
    password: passwordSchema
});
exports.signinInput = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.postInput = zod_1.z.object({
    title: titleSchema,
    content: contentSchema,
    excerpt: zod_1.z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    categoryId: uuidSchema.optional(),
    tags: zod_1.z.array(zod_1.z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional()
});
exports.updatePostInput = zod_1.z.object({
    title: titleSchema,
    content: contentSchema,
    excerpt: zod_1.z.string().max(300, 'Excerpt must be less than 300 characters').optional(),
    categoryId: uuidSchema.optional(),
    tags: zod_1.z.array(zod_1.z.string().min(1).max(50)).max(10, 'Maximum 10 tags allowed').optional(),
    id: uuidSchema
});
// User profile schemas
exports.updateProfileInput = zod_1.z.object({
    name: nameSchema,
    bio: zod_1.z.string().max(500, 'Bio must be less than 500 characters').optional(),
    hobby: zod_1.z.string().max(100, 'Hobby must be less than 100 characters').optional(),
    avatar: zod_1.z.string().url('Invalid avatar URL').optional()
});
// Comment schemas
exports.createCommentInput = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment must be less than 1000 characters'),
    postId: uuidSchema,
    parentId: uuidSchema.optional()
});
// Category schemas
exports.createCategoryInput = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
    description: zod_1.z.string().max(200, 'Description must be less than 200 characters').optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional()
});
// Search and filter schemas
exports.searchInput = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Search query is required').max(100),
    category: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    author: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['recent', 'popular', 'trending', 'oldest']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(50).optional()
});
