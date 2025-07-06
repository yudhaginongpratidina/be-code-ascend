import AuthenticationValidation from "./authentication.validation.js";
import AuthenticationService from "./authentication.service.js";
import Validation from "../../utils/Validation.js";
import FormatDate from "../../utils/FormatDate.js";
import ResponseError from "../../utils/ResponseError.js";
import { decodeToken } from "../../utils/JsonWebToken.js";

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
            const access_token = response.access_token;
            const refresh_token = response.refresh_token;

            const decoded = await decodeToken(access_token, 'access');
            const role = decoded.role;


            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            };

            if (process.env.NODE_ENV === 'production' && process.env.EXPRESS_DOMAIN) {
                cookieOptions.domain = process.env.EXPRESS_DOMAIN;
            }

            res.cookie('refresh_token', refresh_token, cookieOptions);
            res.cookie('authenticated', true, cookieOptions);
            res.cookie('role', role, cookieOptions);
            return res.status(200).json({ message: 'user logged in successfully', token: access_token });
        } catch (e) {
            next(e);
        }
    }

    static async refresh_token(req, res, next) {
        try {
            const authenticated = req.cookies.authenticated;
            const refresh_token = req.cookies.refresh_token;

            if (!authenticated) { throw new ResponseError(401, 'unauthenticated') }
            if (!refresh_token) { throw new ResponseError(401, 'refresh token required') }

            const response = await AuthenticationService.refresh_token(refresh_token);
            return res.status(200).json({ message: 'Token refreshed successfully', token: response });
        } catch (error) {
            next(error);
        }
    }

    static async logout(req, res, next) {
        try {
            const authenticated = req.cookies.authenticated;
            if (!authenticated) { throw new ResponseError(401, 'user not logged in') }

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            };

            if (process.env.NODE_ENV === 'production' && process.env.EXPRESS_DOMAIN) {
                cookieOptions.domain = process.env.EXPRESS_DOMAIN;
            }

            res.clearCookie('refresh_token', cookieOptions);
            res.clearCookie('authenticated', cookieOptions);

            res.json({ message: 'Logout success' });
        } catch (error) {
            next(error);
        }
    }

}
