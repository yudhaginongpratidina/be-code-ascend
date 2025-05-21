import { z } from "zod";

export default class QuizAttemptValidation {
    static CREATE = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        chapter_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        answer: z
            .string()
            .min(3, { message: 'Answer must be at least 3 characters long' })
    });

    static FIND = z.object({
        chapter_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' })
    });
}
