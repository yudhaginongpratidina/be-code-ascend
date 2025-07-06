import AuthenticationRepository from "./authentication.repository.js";
import ResponseError from "../../utils/ResponseError.js";
import { generateToken, refreshAccessToken } from "../../utils/JsonWebToken.js";
import bcrypt from "bcrypt";

export default class AuthenticationService {

    static async register(data) {
        const [emailExists, usernameExists] = await Promise.all([
            AuthenticationRepository.find_email(data.email),
            AuthenticationRepository.find_username(data.username),
        ]);

        if (usernameExists) throw new ResponseError(409, "Username has been registered");
        if (emailExists) throw new ResponseError(409, "Email has been registered");

        data.password = await bcrypt.hash(data.password, 10);
        return AuthenticationRepository.register(data);
    }

    static async login_with_email(data) {
        const user = await AuthenticationRepository.find_email(data.email);
        if (!user) throw new ResponseError(404, "user not found");

        if (user.deleted_at) throw new ResponseError(403, "This account was deleted... but not permanently. Restoration is possible");

        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (!passwordMatch) throw new ResponseError(401, "wrong password");

        const user_payload = {
            id: user.id,
            role: user.role,
        }

        const response = await generateToken(user_payload);
        return response;
    }

    static async login_with_username(data) {
        const user = await AuthenticationRepository.find_username(data.username);
        if (!user) throw new ResponseError(404, "user not found");

        if (user.deleted_at) throw new ResponseError(403, "This account was deleted... but not permanently. Restoration is possible");

        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (!passwordMatch) throw new ResponseError(401, "wrong password");

        const user_payload = {
            id: user.id,
            role: user.role,
        }

        const response = await generateToken(user_payload);
        return response;
    }

    static async refresh_token(refreshToken) {
        const token = await refreshAccessToken(refreshToken);
        const response = token.access_token;
        return response;
    }


}
