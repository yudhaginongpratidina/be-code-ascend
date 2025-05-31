import AuthenticationValidation from "./authentication.validation.js";
import AuthenticationService from "./authentication.service.js";
import Validation from "../../utils/Validation.js";
import FormatDate from "../../utils/FormatDate.js";
import jwt from "jsonwebtoken";

export default class AuthenticationController {

    static async register(req, res, next) {
        try {
            const data = await Validation.validate(AuthenticationValidation.REGISTER, req.body);
            const response = await AuthenticationService.register(data);
            res.status(201).json({
                message: "user registered successfully",
                data: {
                    id: response.id,
                    full_name: response.full_name,
                    username: response.username,
                    email: response.email,
                    role: response.role,
                    point: response.point,
                    experience: response.experience,
                    created_at: FormatDate(response.created_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async login(req, res, next) {
        try {
            const data = await Validation.validate(AuthenticationValidation.LOGIN, req.body);

            const loginMethodMap = {
                login_with_username: AuthenticationService.login_with_username,
                login_with_email: AuthenticationService.login_with_email,
            };

            const response = await loginMethodMap[data.type](data);

            const id = response.id;
            const username = response.username;
            const role = response.role;

            const access_token = jwt.sign({ id, role, username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });
            // const refresh_token = jwt.sign({ id, role, username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN });

            res.status(200).json({
                message: "user logged in successfully",
                data: { 
                    token: access_token
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async refresh_token(req, res, next) {
        try {
            const refresh_token = req.cookies.refresh_token;
            if (!refresh_token) return res.sendStatus(401);

            const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
            if (!decoded) return res.sendStatus(403);

            const id = decoded.id;
            const username = decoded.username;
            const role = decoded.role;
            const access_token = jwt.sign({ id, role, username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN });

            res.status(200).json({ message: "Token refreshed successfully", data: { token: access_token } });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            if (!req.cookies.refresh_token) return res.status(401).json({ message: "user not logged in" });
            res.clearCookie('refresh_token', { maxAge: 0 });
            res.status(200).json({ message: 'Logout success' });
        } catch (error) {
            next(error);
        }
    }

}
