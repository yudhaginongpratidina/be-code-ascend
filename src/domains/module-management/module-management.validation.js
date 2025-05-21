import { z } from "zod";

export default class ModuleManagementValidation {
    static CREATE = z.object({
        title: z
            .string()
            .min(3, { message: 'Title must be at least 3 characters long' }),
        description: z
            .string()
            .min(3),
        level: z
            .enum(['beginner', 'intermediate', 'advanced'], {
                errorMap: () => ({ message: 'Level must be beginner, intermediate, or advanced' }),
            }),
    });

    static SEARCH = z.object({
        type: z.enum([
            'search_all',
            'search_by_id',
            'search_by_title',
            'search_by_creator_id',
            'search_by_level',
            'search_by_me',
            'search_member_by_module_id',
        ], {
            errorMap: () => ({
                message: 'Type must be search_all, search_by_id, search_by_title, search_by_creator_id, or search_by_level, search_member_by_module_id'
            }),
        }),
        value: z
            .string()
            .optional(),
    }).superRefine((data, ctx) => {
        if (data.type === 'search_by_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_id',
            });
        }

        if (data.type === 'search_by_title' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_title',
            });
        }

        if (data.type === 'search_by_creator_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_creator_id',
            });
        }

        if (data.type === 'search_by_level' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_level',
            });
        }

        if (data.type === 'search_member_by_module_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_member_by_module_id',
            });
        }
    })

    static UPDATE = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        title: z
            .string()
            .min(3, { message: 'Title must be at least 3 characters long' }),
        description: z
            .string()
            .min(3),
        level: z
            .enum(['beginner', 'intermediate', 'advanced'], {
                errorMap: () => ({ message: 'Level must be beginner, intermediate, or advanced' }),
            }),
        is_free: z
            .boolean({
                errorMap: () => ({ message: 'Is free must be true or false' }),
            }),
        is_published: z
            .boolean({
                errorMap: () => ({ message: 'Is published must be true or false' }),
            }),
    });
}
