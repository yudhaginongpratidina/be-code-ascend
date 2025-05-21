import prismaClient from "../../application/database.js";

export default class AccountRepository {

    static async find_by_id(id) {
        return await prismaClient.user.findUnique({
            where: {
                id: id
            }
        })
    }

    static async update_detail_information(id, data) {
        return await prismaClient.user.update({
            where: {
                id: id
            },
            data: {
                full_name: data.full_name,
                updated_at: new Date()
            }
        });
    }

    static async update_password(id, data) {
        return await prismaClient.user.update({
            where: {
                id: id
            },
            data: {
                password: data,
                updated_at: new Date()
            }
        });
    }

}
