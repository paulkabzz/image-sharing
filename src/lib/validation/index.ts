import * as z from "zod";

// Regex pattern to allow only letters, numbers, periods, and underscores
// with no consecutive periods and not starting or ending with a period
const namePattern = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]+$/;

export const SignupValidation = z.object({
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters." }),
    username: z.string()
        .min(2, { message: "Username must be at least 2 characters." })
        .regex(namePattern, { message: "Username can only contain letters, numbers, periods, and underscores, with no consecutive periods and not starting or ending with a period." }),
    email: z.string().email(),
    password: z.string().min(8, { message: "Password should be a minimum of 8 characters." }),
});

export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password should be a minimum of 8 characters." }),
});

export const PostValidation = z.object({
    caption: z.string().min(0).max(2200),
    file: z.custom<File[]>(),
    location: z.string().min(0).max(100),
    tags: z.string(),
});

export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string()
        .min(2, { message: "Name must be at least 2 characters." }),
    username: z.string()
        .min(2, { message: "Username must be at least 2 characters." })
        .regex(namePattern, { message: "Username can only contain letters, numbers, periods, and underscores, with no consecutive periods and not starting or ending with a period." }),
    email: z.string().email(),
    bio: z.string(),
});
