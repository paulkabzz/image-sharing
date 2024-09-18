import * as z from "zod";

 
export const SignupValidation = z.object({
    name: z.string().min(2, { message: "too short" }),
    username: z.string().min(2, {message: "Too short"}),
    email: z.string().email(),
    password: z.string().min(8, { message: "Password should be a minimum of 8 characters" }),
});
 
export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password should be a minimum of 8 characters" }),
});

export const PostValidation = z.object({
    caption: z.string().min(0).max(2200),
    file: z.custom<File[]>(),
    location: z.string().min(0).max(100),
    tags: z.string(),
});

export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string(),
});