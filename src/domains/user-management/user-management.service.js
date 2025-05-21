import UserManagementRepository from "./user-management.repository.js";
import ResponseError from "../../utils/ResponseError.js";

export default class UserManagementService {

    static async find_all() {
        return await UserManagementRepository.find_all();
    }

    static async find_by_id(id) {
        const user = await UserManagementRepository.find_by_id(id);
        if (!user) throw new ResponseError(404, "user not found");
        return user;
    }

    static async find_by_username(username) {
        const user = await UserManagementRepository.find_by_username(username);
        if (!user) throw new ResponseError(404, "user not found");
        return user;
    }

    static async update_role(id, role) {
        const user = await UserManagementRepository.find_by_id(id);
        if (!user) throw new ResponseError(404, "user not found");
        return await UserManagementRepository.update_role(id, role);
    }

}
