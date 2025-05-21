import { z } from "zod";

export default class EnrollmentManagementValidation {
    static ENROLL_MODULE = z.object({
        module_id: z
            .string()
            .min(3, { message: 'Module ID must be at least 3 characters long' }),
    });
}
