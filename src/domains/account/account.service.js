import AccountRepository from "./account.repository.js";
import ResponseError from "../../utils/ResponseError.js";
import bcrypt from "bcrypt";

export default class AccountService {
    
    static async find_by_id(id) {
        const user = await AccountRepository.find_by_id(id);
        if (!user) throw new ResponseError(404, "user not found");
        return user;
    }

    static async update_detail_information(id, data) {
        const user = await AccountRepository.find_by_id(id);
        if (!user) throw new ResponseError(404, "user not found");
        return await AccountRepository.update_detail_information(id, data);
    }

    static async update_password(id, data) {
        const user = await AccountRepository.find_by_id(id);
        if (!user) throw new ResponseError(404, "user not found");

        const passwordMatch = await bcrypt.compare(data.old_password, user.password);
        if (!passwordMatch) throw new ResponseError(401, "old password is wrong");
        const hashPassword = await bcrypt.hash(data.new_password, 10);
        return await AccountRepository.update_password(id, hashPassword);
    }

}
