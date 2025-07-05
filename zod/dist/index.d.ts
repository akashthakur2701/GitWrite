import { z } from 'zod';
export declare const signupInput: z.ZodObject<{
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name?: string | undefined;
}, {
    email: string;
    password: string;
    name?: string | undefined;
}>;
export declare const signinInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const postInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}, {
    title: string;
    content: string;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const updatePostInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    id: string;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}, {
    title: string;
    content: string;
    id: string;
    excerpt?: string | undefined;
    categoryId?: string | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateProfileInput: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    hobby: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    bio?: string | undefined;
    hobby?: string | undefined;
    avatar?: string | undefined;
}, {
    name?: string | undefined;
    bio?: string | undefined;
    hobby?: string | undefined;
    avatar?: string | undefined;
}>;
export declare const createCommentInput: z.ZodObject<{
    content: z.ZodString;
    postId: z.ZodString;
    parentId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}, {
    content: string;
    postId: string;
    parentId?: string | undefined;
}>;
export declare const createCategoryInput: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    color?: string | undefined;
}>;
export declare const searchInput: z.ZodObject<{
    query: z.ZodString;
    category: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    author: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodEnum<["recent", "popular", "trending", "oldest"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    tags?: string[] | undefined;
    category?: string | undefined;
    author?: string | undefined;
    sortBy?: "recent" | "popular" | "trending" | "oldest" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}, {
    query: string;
    tags?: string[] | undefined;
    category?: string | undefined;
    author?: string | undefined;
    sortBy?: "recent" | "popular" | "trending" | "oldest" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}>;
export type signinInputType = z.infer<typeof signinInput>;
export type signupInputType = z.infer<typeof signupInput>;
export type postInputType = z.infer<typeof postInput>;
export type updatePostInputType = z.infer<typeof updatePostInput>;
export type updateProfileInputType = z.infer<typeof updateProfileInput>;
export type createCommentInputType = z.infer<typeof createCommentInput>;
export type createCategoryInputType = z.infer<typeof createCategoryInput>;
export type searchInputType = z.infer<typeof searchInput>;
