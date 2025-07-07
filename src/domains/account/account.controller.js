import AccountValidation from "./account.validation.js";
import AccountService from "./account.service.js";
import FormatDate from "../../utils/FormatDate.js";
import Validation from "../../utils/Validation.js";
import jwt from "jsonwebtoken";

export default class AccountController {
    static async index(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });
            const id = token.id;

            const getUserLevel = (experience) => {
                if (experience >= 10000) return "Master";
                if (experience >= 5000) return "Expert";
                if (experience >= 2000) return "Advanced";
                if (experience >= 500) return "Intermediate";
                if (experience >= 100) return "Beginner";
                return "Newbie";
            };

            const response = await AccountService.find_by_id(id);
            res.status(200).json({
                message: "Successfully obtained user data",
                data: {
                    id: response.id,
                    full_name: response.full_name,
                    username: response.username,
                    email: response.email,
                    role: response.role,
                    point: response.point,
                    experience: response.experience,
                    badge: getUserLevel(response.experience),
                    created_at: FormatDate(response.created_at),
                    updated_at: FormatDate(response.updated_at),
                    deleted_at: FormatDate(response.deleted_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }


    static async update(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const id = token.id;
            const data = await Validation.validate(AccountValidation.UPDATE, req.body);

            if (data.type === "update_detail_information") {
                const response = await AccountService.update_detail_information(id, data);
                res.status(200).json({
                    message: "Successfully updated user details",
                    data: {
                        id: response.id,
                        full_name: response.full_name,
                        username: response.username,
                        email: response.email,
                        role: response.role,
                        point: response.point,
                        experience: response.experience,
                        updated_at: FormatDate(response.updated_at),
                    }
                });
            }

            if (data.type === "update_password") {
                const response = await AccountService.update_password(id, data);
                res.status(200).json({
                    message: "Successfully updated user password",
                    data: {
                        id: response.id,
                        full_name: response.full_name,
                        username: response.username,
                        email: response.email,
                        password: response.password,
                        role: response.role,
                        point: response.point,
                        experience: response.experience,
                        updated_at: FormatDate(response.updated_at),
                    }
                });
            }
        } catch (e) {
            next(e);
        }
    }
}
