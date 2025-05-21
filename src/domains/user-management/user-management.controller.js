import UserManagementValidation from "./user-management.validation.js";
import UserManagementService from "./user-management.service.js";
import FormatDate from "../../utils/FormatDate.js";
import Validation from "../../utils/Validation.js";

export default class UserManagementController {
    static async index(req, res, next) {
        try {
            const users = await UserManagementService.find_all();
            const response = users.map(user => ({
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                role: user.role,
                point: user.point,
                experience: user.experience,
                created_at: FormatDate(user.created_at),
                updated_at: FormatDate(user.updated_at),
                deleted_at: FormatDate(user.deleted_at)
            }));
            res.status(200).json({
                message: "successfully obtained all user data",
                data: {
                    total_user: users.length,
                    total_by_role: {
                        user: users.filter(user => user.role === "user").length,
                        contributor: users.filter(user => user.role === "contributor").length,
                        admin: users.filter(user => user.role === "admin").length,
                        superadmin: users.filter(user => user.role === "superadmin").length,
                    },
                    users_by_role: {
                        user: response.filter(user => user.role === "user"),
                        contributor: response.filter(user => user.role === "contributor"),
                        admin: response.filter(user => user.role === "admin"),
                        superadmin: response.filter(user => user.role === "superadmin"),
                    }
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async create(req, res, next) {
        try {
            res.send("UserManagement create form");
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            res.send("UserManagement stored");
        } catch (e) {
            next(e);
        }
    }

    static async show(req, res, next) {
        try {
            const data = await Validation.validate(UserManagementValidation.SEARCH, req.body);

            let user;

            if (data.type === "search_by_id") {
                user = await UserManagementService.find_by_id(data.id);
            }
    
            if (data.type === "search_by_username") {
                user = await UserManagementService.find_by_username(data.username);
            }

            const response = {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                role: user.role,
                point: user.point,
                experience: user.experience,
                created_at: FormatDate(user.created_at),
                updated_at: FormatDate(user.updated_at),
                deleted_at: FormatDate(user.deleted_at)
            };
    
            res.status(200).json({
                message: "Successfully obtained user data",
                data: response
            });
        } catch (err) {
            next(err);
        }
    }
    

    static async edit(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`UserManagement edit ${id}`);
        } catch (e) {
            next(e);
        }
    }

    static async update(req, res, next) {
        try {
            const data = await Validation.validate(UserManagementValidation.UPDATE, req.body);

            if (data.type === "update_role") {
                const response = await UserManagementService.update_role(data.id, data.role);
                res.status(200).json({
                    message: "Successfully updated user role",
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

        } catch (e) {
            next(e);
        }
    }

    static async destroy(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`UserManagement deleted ${id}`);
        } catch (e) {
            next(e);
        }
    }
}
