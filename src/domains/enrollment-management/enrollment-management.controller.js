import EnrollmentManagementValidation from "./enrollment-management.validation.js";
import EnrollmentManagementService from "./enrollment-management.service.js";
import FormatDate from "../../utils/FormatDate.js";
import Validation from "../../utils/Validation.js";
import jwt from "jsonwebtoken";

export default class EnrollmentManagementController {
    static async index(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const user_id = decoded.id;

            const response = await EnrollmentManagementService.find_enrollment_by_me(user_id);
            res.status(200).json({
                message: "Successfully obtained enrollment data",
                data: response.map((enrollment) => {
                    return {
                        id: enrollment.id,
                        user_id: {
                            id: enrollment.user.id,
                            name: enrollment.user.full_name
                        },
                        module_id: {
                            id: enrollment.module.id,
                            title: enrollment.module.title,
                            level: enrollment.module.level,
                            count_chapters: enrollment.module.chapters.length
                        },
                        created_at: FormatDate(enrollment.created_at)
                    }
                })
            })
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const user_id = decoded.id;
            const data = await Validation.validate(EnrollmentManagementValidation.ENROLL_MODULE, req.body);
            const response = await EnrollmentManagementService.enroll_module(user_id, data.module_id);
            res.status(201).json({
                message: "module enrolled successfully",
                data: {
                    id: response.id,
                    user_id: {
                        id: response.user.id,
                        name: response.user.full_name
                    },
                    module_id: {
                        id: response.module.id,
                        title: response.module.title
                    },
                    created_at: FormatDate(response.created_at)
                }
            })
        } catch (e) {
            next(e);
        }
    }

    static async show(req, res, next) {
        try {
            const { id } = req.params;
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            const user_id = decoded.id;
            const response = await EnrollmentManagementService.find_detail_enrollment(user_id, id);
            res.status(200).json({
                messege: "Successfully obtained enrollment data",
                data: {
                    id: response.id,
                    module: {
                        id: response.module.id,
                        title: response.module.title,
                        description: response.module.description,
                        level: response.module.level,
                        author: {
                            id: response.module.creator_id,
                            name: response.module.creator.full_name
                        },
                        chapters: response.module.chapters.map((chapter) => {
                            const rewards = chapter.with_question
                                ? {
                                    point_earned: chapter.point_earned,
                                    exp_earned: chapter.exp_earned
                                }
                                : {
                                    exp_earned: chapter.exp_earned
                                };

                            return {
                                id: chapter.id,
                                title: chapter.title,
                                with_question: chapter.with_question,
                                rewards
                            };
                        })
                    }
                }
            });

        } catch (e) {
            next(e);
        }
    }

}
