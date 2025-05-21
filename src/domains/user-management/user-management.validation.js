import { z } from "zod";

export default class UserManagementValidation {
    static SEARCH = z.object({
        type: z.enum(['search_by_id', 'search_by_username'], {
            errorMap: () => ({ message: 'Type must be search_by_id or search_by_username' }),
        }),
        id: z
            .string()
            .min(5, { message: 'ID must be at least 5 characters long' })
            .optional(),
        username: z
            .string()
            .min(3, { message: 'Username must be at least 3 characters long' })
            .max(20, { message: 'Username must be at most 20 characters long' })
            .regex(/^[a-zA-Z0-9_]+$/, { message: 'Username can only contain letters, numbers, and underscores' })
            .optional(),
    }).superRefine((data, ctx) => {
        if (data.type === 'search_by_id' && !data.id) {
            ctx.addIssue({
                path: ['id'],
                code: z.ZodIssueCode.custom,
                message: 'ID is required when type is search_by_id',
            });
        }

        if (data.type === 'search_by_username' && !data.username) {
            ctx.addIssue({
                path: ['username'],
                code: z.ZodIssueCode.custom,
                message: 'Username is required when type is search_by_username',
            });
        }
    });

    static UPDATE = z.object({
        type: z.enum(['update_role'], {
            errorMap: () => ({ message: 'Type must be update_role' }),
        }),
        id: z
            .string()
            .min(5, { message: 'ID must be at least 5 characters long' })
            .optional(),
        role: z.enum(['user', 'contributor', 'admin', 'superadmin'], {
            errorMap: () => ({
                message: 'Role must be one of: user, contributor, admin, or superadmin',
            }),
        }).optional(),
    }).superRefine((data, ctx) => {
        switch (data.type) {
            case 'update_role':
                if (!data.id) {
                    ctx.addIssue({
                        path: ['id'],
                        code: z.ZodIssueCode.custom,
                        message: 'ID is required for update_role',
                    });
                }
                if (!data.role) {
                    ctx.addIssue({
                        path: ['role'],
                        code: z.ZodIssueCode.custom,
                        message: 'Role is required for update_role',
                    });
                }
                break;
        }
    });

}
