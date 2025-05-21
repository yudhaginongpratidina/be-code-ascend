import UserRepository from "../user-management/user-management.repository.js";
import EnrollmentManagementRepository from "./enrollment-management.repository.js";
import ResponseError from "../../utils/ResponseError.js";

export default class EnrollmentManagementService {
    static async enroll_module(user_id, module_id) {

        // cari module
        const find_module = await EnrollmentManagementRepository.find_module_by_id(module_id);
        if (!find_module) throw new ResponseError(404, "module not found");

        // cari user
        const find_user = await UserRepository.find_by_id(user_id);
        if (!find_user) throw new ResponseError(404, "user not found");

        // cek apakah user sudah mendaftar module ini
        const check_enrollment = await EnrollmentManagementRepository.check_enrollment(user_id, module_id);
        if (check_enrollment) throw new ResponseError(409, "You have already enrolled in this module");

        // cek apakah module ini free
        if (find_module.is_free === true) {
            return await EnrollmentManagementRepository.enroll_module(user_id, module_id);
        } else {
            // cek apakah user punya cukup point
            if (find_user.point < find_module.points_required) throw new ResponseError(400, "You don't have enough points");

            // kurangi point user
            await EnrollmentManagementRepository.decrease_points(user_id, find_module.points_required);
            return await EnrollmentManagementRepository.enroll_module(user_id, module_id);
        }

    }

    static async find_enrollment_by_me(user_id) {
        return await EnrollmentManagementRepository.find_enrollment_by_me(user_id);
    }

    static async find_detail_enrollment(user_id, module_id) {
        // cari user
        const find_user = await UserRepository.find_by_id(user_id);
        if (!find_user) throw new ResponseError(404, "user not found");

        // cari module
        const find_module = await EnrollmentManagementRepository.find_module_by_id(module_id);
        if (!find_module) throw new ResponseError(404, "module not found");

        // cek apakah user sudah mendaftar module ini
        const check_enrollment = await EnrollmentManagementRepository.check_enrollment(user_id, module_id);
        if (!check_enrollment) throw new ResponseError(404, "You haven't enrolled in this module");

        return await EnrollmentManagementRepository.find_detail_enrollment(user_id, module_id);
    }

}
