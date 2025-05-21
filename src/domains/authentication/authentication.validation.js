import { z } from "zod";

export default class AuthenticationValidation {
    static REGISTER = z.object({
        full_name: z
            .string()
            .nonempty('Full name is required')
            .min(3, 'Full name must be at least 3 characters long')
            .max(50, 'Full name must be at most 50 characters long'),
        email: z
            .string()
            .email(),
        username: z
            .string()
            .nonempty('Username is required')
            .min(3, 'Username must be at least 3 characters long')
            .max(20, 'Username must be at most 20 characters long')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: z
            .string()
            .nonempty('Password is required')
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must be at most 20 characters long'),
        confirm_password: z
            .string()
            .nonempty('Password is required')
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must be at most 20 characters long'),
    }).refine((data) => data.password === data.confirm_password, {
        message: 'Passwords do not match',
        path: ['confirm_password'],
    });

    static LOGIN = z
        .object({
            type: z.enum(['login_with_username', 'login_with_email'], {
                errorMap: () => ({ message: 'Type must be login_with_username or login_with_email' }),
            }),
            username: z
                .string()
                .min(3, 'Username must be at least 3 characters long')
                .max(20, 'Username must be at most 20 characters long')
                .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
                .optional(),
            email: z
                .string()
                .email('Email must be valid')
                .optional(),
            password: z
                .string()
                .min(6, 'Password must be at least 6 characters long')
                .max(20, 'Password must be at most 20 characters long'),
        })
        .superRefine((data, ctx) => {
            if (data.type === 'login_with_username' && !data.username) {
                ctx.addIssue({
                    path: ['username'],
                    message: 'Username is required when using login_with_username',
                    code: z.ZodIssueCode.custom,
                });
            }

            if (data.type === 'login_with_email' && !data.email) {
                ctx.addIssue({
                    path: ['email'],
                    message: 'Email is required when using login_with_email',
                    code: z.ZodIssueCode.custom,
                });
            }
        });
}
