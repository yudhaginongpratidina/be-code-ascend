import { z } from "zod";

export default class ChapterProgressValidation {
    static CREATE = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        chapter_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' })
    });

    static FIND_CHAPTERS = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' })
    });
}
