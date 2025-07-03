import {z} from 'zod';

export const signupInput = z.object({
email : z.string().email(),
name : z.string().optional(),
password : z.string().min(6)
})
export const signinInput = z.object({
email : z.string().email(),
password : z.string().min(6)
})
export const postInput = z.object({
    title : z.string(),
    content : z.string()
})
export const updatePostInput = z.object({
    title : z.string(),
    content : z.string(),
    id : z.string()
})

export type signinInputType = z.infer<typeof signinInput>
export type signupInputType = z.infer<typeof signupInput>
export type postInputType = z.infer<typeof postInput>
export type updatePostInputType = z.infer<typeof updatePostInput>