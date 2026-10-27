import z from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
    name: z.string().min(2, { message: "username must be at least 2 characters long" }),
});

export const signinSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
});

export const createPostSchema = z.object({
    images: z.array(z.object({
        url: z.string().url({ message: "Invalid URL" }),
        size: z.number().max(5 * 1024 * 1024, { message: "Image size must be less than 5MB" })
    })).max(5, { message: "You can upload a maximum of 5 images" }),
    video: z.object({
        url: z.string().url({ message: "Invalid URL" }),
        size: z.number().max(500 * 1024 * 1024, { message: "Video size must be less than 500MB" })
    }).optional()
});