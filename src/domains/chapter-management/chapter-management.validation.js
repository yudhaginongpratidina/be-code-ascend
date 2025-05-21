import { z } from "zod";

export default class ChapterManagementValidation {
    static CREATE = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        title: z
            .string()
            .min(3, { message: 'Title must be at least 3 characters long' }),
        content: z
            .string()
            .min(3, { message: 'Content must be at least 3 characters long' }),
        with_question: z.boolean({
            required_error: 'with_question flag is required',
        }),
        question: z
            .string()
            .min(3, { message: 'Question must be at least 3 characters long' })
            .optional(),
        answer_1: z
            .string()
            .min(3, { message: 'Answer 1 must be at least 3 characters long' })
            .optional(),
        answer_2: z
            .string()
            .min(3, { message: 'Answer 2 must be at least 3 characters long' })
            .optional(),
        answer_3: z
            .string()
            .min(3, { message: 'Answer 3 must be at least 3 characters long' })
            .optional(),
        correct_answer: z
            .string()
            .min(3, { message: 'Correct answer must be at least 3 characters long' })
            .optional(),
        is_published: z
            .boolean({
                required_error: 'Is published is required',
            }),
    }).superRefine((data, ctx) => {
        const {
            with_question,
            question,
            answer_1,
            answer_2,
            answer_3,
            correct_answer,
        } = data;

        if (with_question) {
            // Semua bagian soal dan jawaban wajib ada
            if (!question || !answer_1 || !answer_2 || !answer_3 || !correct_answer) {
                ctx.addIssue({
                    path: ['question'],
                    code: z.ZodIssueCode.custom,
                    message: 'Required fields: question, answer_1, answer_2, answer_3, and correct_answer must be filled when "with_question" is true.',
                });
            }

            // Cek correct_answer harus salah satu dari ketiga jawaban
            if (
                correct_answer &&
                (correct_answer !== answer_1 &&
                    correct_answer !== answer_2 &&
                    correct_answer !== answer_3)
            ) {
                ctx.addIssue({
                    path: ['correct_answer'],
                    code: z.ZodIssueCode.custom,
                    message: 'Correct answer must be one of the provided answers',
                });
            }

            // Cek jawaban harus unik
            if (answer_1 && answer_2 && answer_3) {
                const answers = [answer_1, answer_2, answer_3];
                const uniqueAnswers = new Set(answers);
                if (uniqueAnswers.size !== 3) {
                    ['answer_1', 'answer_2', 'answer_3'].forEach((field) => {
                        ctx.addIssue({
                            path: [field],
                            code: z.ZodIssueCode.custom,
                            message: 'Answers must be unique',
                        });
                    });
                }
            }
        }
    });

    static UPDATE = z.object({
        id: z
            .string()
            .min(3, { message: 'ID must be at least 3 characters long' }),
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
        title: z
            .string()
            .min(3, { message: 'Title must be at least 3 characters long' }),
        content: z
            .string()
            .min(3, { message: 'Content must be at least 3 characters long' }),
        with_question: z.boolean({
            required_error: 'with_question flag is required',
        }),
        question: z
            .string()
            .min(3, { message: 'Question must be at least 3 characters long' })
            .optional(),
        answer_1: z
            .string()
            .min(3, { message: 'Answer 1 must be at least 3 characters long' })
            .optional(),
        answer_2: z
            .string()
            .min(3, { message: 'Answer 2 must be at least 3 characters long' })
            .optional(),
        answer_3: z
            .string()
            .min(3, { message: 'Answer 3 must be at least 3 characters long' })
            .optional(),
        correct_answer: z
            .string()
            .min(3, { message: 'Correct answer must be at least 3 characters long' })
            .optional(),
        is_published: z
            .boolean({
                required_error: 'Is published is required',
            }),
    }).superRefine((data, ctx) => {
        const {
            with_question,
            question,
            answer_1,
            answer_2,
            answer_3,
            correct_answer,
        } = data;

        if (with_question) {
            // Semua bagian soal dan jawaban wajib ada
            if (!question || !answer_1 || !answer_2 || !answer_3 || !correct_answer) {
                ctx.addIssue({
                    path: ['question'],
                    code: z.ZodIssueCode.custom,
                    message: 'Required fields: question, answer_1, answer_2, answer_3, and correct_answer must be filled when "with_question" is true.',
                });
            }

            // Cek correct_answer harus salah satu dari ketiga jawaban
            if (
                correct_answer &&
                (correct_answer !== answer_1 &&
                    correct_answer !== answer_2 &&
                    correct_answer !== answer_3)
            ) {
                ctx.addIssue({
                    path: ['correct_answer'],
                    code: z.ZodIssueCode.custom,
                    message: 'Correct answer must be one of the provided answers',
                });
            }

            // Cek jawaban harus unik
            if (answer_1 && answer_2 && answer_3) {
                const answers = [answer_1, answer_2, answer_3];
                const uniqueAnswers = new Set(answers);
                if (uniqueAnswers.size !== 3) {
                    ['answer_1', 'answer_2', 'answer_3'].forEach((field) => {
                        ctx.addIssue({
                            path: [field],
                            code: z.ZodIssueCode.custom,
                            message: 'Answers must be unique',
                        });
                    });
                }
            }
        }
    });


    static SEARCH = z.object({
        type: z.enum([
            'search_by_module_id',
            'search_by_id',
            'search_by_id_only_by_creator_id',
            'module_id_only_by_creator_id',
            'search_by_module_id_enrolled'
        ], {
            errorMap: () => ({
                message: 'Type must be search_by_module_id, search_by_id_only_by_creator_id, search_by_module_id_enrolled, or module_id_only_by_creator_id',
            }),
        }),
        value: z
            .string()
            .optional(),
    }).superRefine((data, ctx) => {
        if (data.type === 'search_by_module_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_module_id',
            });
        }

        if (data.type === 'search_by_module_id_enrolled' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_module_id_enrolled',
            });
        }

        if (data.type === 'search_by_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_module_id',
            });
        }

        if (data.type === 'search_by_id_and_by_creator_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is search_by_id',
            });
        }

        if (data.type === 'module_id_only_by_creator_id' && !data.value) {
            ctx.addIssue({
                path: ['value'],
                code: z.ZodIssueCode.custom,
                message: 'Value is required when type is module_id_only_by_creator_id',
            });
        }
    })
}
