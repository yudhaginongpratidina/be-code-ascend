import { z } from "zod";

export default class AccountValidation {
    static UPDATE = z.object({
        type: z.enum(['update_password', 'update_detail_information'], {
            errorMap: () => ({ message: 'Type must be update_password or update_detail_information' }),
        }),
        full_name: z
            .string()
            .min(3, 'Full name must be at least 3 characters long')
            .max(200, 'Full name must be at most 200 characters long')
            .optional(),
        old_password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must be at most 20 characters long')
            .optional(),
        new_password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must be at most 20 characters long')
            .optional(),
        confirm_password: z
            .string()
            .min(6, 'Password must be at least 6 characters long')
            .max(20, 'Password must be at most 20 characters long')
            .optional(),
    }).superRefine((data, ctx) => {
        switch (data.type) {
            case 'update_detail_information':
                if (!data.full_name) {
                    ctx.addIssue({
                        path: ['full_name'],
                        code: z.ZodIssueCode.custom,
                        message: 'Full name is required when type is update_detail_information',
                    });
                }
                break;

            case 'update_password':
                if (!data.old_password) {
                    ctx.addIssue({
                        path: ['old_password'],
                        code: z.ZodIssueCode.custom,
                        message: 'Old password is required when type is update_password',
                    });
                }
                if (!data.new_password) {
                    ctx.addIssue({
                        path: ['new_password'],
                        code: z.ZodIssueCode.custom,
                        message: 'New password is required when type is update_password',
                    });
                }
                if (!data.confirm_password) {
                    ctx.addIssue({
                        path: ['confirm_password'],
                        code: z.ZodIssueCode.custom,
                        message: 'Confirm password is required when type is update_password',
                    });
                }
                if (data.new_password && data.confirm_password && data.new_password !== data.confirm_password) {
                    ctx.addIssue({
                        path: ['confirm_password'],
                        code: z.ZodIssueCode.custom,
                        message: 'Passwords do not match',
                    });
                }
                break;
        }
    });
}
