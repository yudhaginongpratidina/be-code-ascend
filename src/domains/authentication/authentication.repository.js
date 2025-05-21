import prismaClient from "../../application/database.js";

export default class AuthenticationRepository {
    static async find_username(username) {
        return await prismaClient.user.findUnique({
            where: {
                username: username
            }
        });
    }

    static async find_email(email) {
        return await prismaClient.user.findUnique({
            where: {
                email: email
            }
        });
    }

    static async register(data) {
        return await prismaClient.user.create({
            data: {
                full_name: data.full_name,
                username: data.username,
                email: data.email,
                password: data.password
            }
        });
    }
}
