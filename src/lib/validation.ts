import z from 'zod';

export const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
    username: z.string().min(2, { message: "username must be at least 2 characters long" }),
});

export const signinSchema = z.object({
    identifier: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(4, { message: "Password must be at least 4 characters long" }),
});