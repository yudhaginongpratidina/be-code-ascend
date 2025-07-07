import ChapterManagementValidation from "./chapter-management.validation.js";
import ChapterManagementService from "./chapter-management.service.js";
import { decodeToken } from "../../utils/JsonWebToken.js";
import Validation from "../../utils/Validation.js";
import FormatDate from "../../utils/FormatDate.js";
import jwt from "jsonwebtoken";

export default class ChapterManagementController {
    static async index(req, res, next) {
        try {
            const data = await Validation.validate(ChapterManagementValidation.SEARCH, req.body);

            if (data.type === "search_by_module_id") {
                const response = await ChapterManagementService.find_by("module_id", data.value);
                res.status(200).json({
                    message: "Successfully obtained chapter data",
                    data: response.map((chapter) => {
                        return {
                            id: chapter.id,
                            module_id: chapter.module_id,
                            title: chapter.title,
                            with_question: chapter.with_question,
                            point_earned: chapter.point_earned,
                            exp_earned: chapter.exp_earned,
                            module: {
                                id: chapter.module.id,
                                title: chapter.module.title
                            }
                        }
                    })
                })
            }

            if (data.type === "search_by_module_id_enrolled") {
                const response = await ChapterManagementService.find_by("module_id_enrolled", data.value);
                res.status(200).json({
                    message: "Successfully obtained chapter data",
                    data: response.map((chapter) => {
                        return {
                            id: chapter.id,
                            module_id: chapter.module_id,
                            title: chapter.title,
                            with_question: chapter.with_question,
                            point_earned: chapter.point_earned,
                            exp_earned: chapter.exp_earned,
                            module: {
                                id: chapter.module.id,
                                title: chapter.module.title
                            }
                        }
                    })
                })
            }

            if (data.type === "search_by_id") {
                const response = await ChapterManagementService.find_by("id", data.value);
                res.status(200).json({
                    message: "Successfully obtained chapter data",
                    data: {
                        id: response.id,
                        module_id: response.module_id,
                        title: response.title,
                        content: response.content,
                        with_question: response.with_question,
                        question: response.question,
                        answer_1: response.answer_1,
                        answer_2: response.answer_2,
                        answer_3: response.answer_3,
                    }
                })
            }

            if (data.type === "search_by_id_only_by_creator_id") {
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                if (!token) return res.status(401).json({ message: "user not logged in" });

                const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
                const creator_id = decoded.id;

                const response = await ChapterManagementService.find_by("id_only_by_creator_id", data.value, creator_id);
                res.status(200).json({
                    message: "Successfully obtained chapter data",
                    data: response
                })
            }

            if (data.type === "module_id_only_by_creator_id") {
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                if (!token) return res.status(401).json({ message: "user not logged in" });

                const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
                const creator_id = decoded.id;

                const response = await ChapterManagementService.find_by("module_id_only_by_creator_id", data.value, creator_id);
                res.status(200).json({
                    message: "Successfully obtained chapter data",
                    data: response
                })
            }
        } catch (e) {
            next(e);
        }
    }


    static async store(req, res, next) {
        try {
            const token = req.token
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const creator_id = token.id;
            const data = await Validation.validate(ChapterManagementValidation.CREATE, req.body);

            const response = await ChapterManagementService.create_chapter(creator_id, data);
            res.status(201).json({
                message: "chapter created successfully",
                data: {
                    id: response.id,
                    module_id: response.module_id,
                    creator_id: response.creator_id,
                    title: response.title,
                    content: response.content,
                    with_question: response.with_question,
                    question: response.question,
                    answer_1: response.answer_1,
                    answer_2: response.answer_2,
                    answer_3: response.answer_3,
                    correct_answer: response.correct_answer,
                    point_earned: response.point_earned,
                    exp_earned: response.exp_earned,
                    is_published: response.is_published,
                    created_at: FormatDate(response.created_at)
                }
            })
        } catch (e) {
            next(e);
        }
    }


    static async update(req, res, next) {
        try {
            const token = req.token
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const creator_id = token.id;
            const data = await Validation.validate(ChapterManagementValidation.UPDATE, req.body);

            const response = await ChapterManagementService.update_chapter_by_module_id(creator_id, data);
            res.status(200).json({
                message: "chapter updated successfully",
                data: {
                    id: response.id,
                    module_id: response.module_id,
                    creator_id: response.creator_id,
                    title: response.title,
                    content: response.content,
                    with_question: response.with_question,
                    question: response.question,
                    answer_1: response.answer_1,
                    answer_2: response.answer_2,
                    answer_3: response.answer_3,
                    correct_answer: response.correct_answer,
                    point_earned: response.point_earned,
                    exp_earned: response.exp_earned,
                    is_published: response.is_published,
                    updated_at: FormatDate(response.updated_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async destroy(req, res, next) {
        try {
            const token = req.token
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const creator_id = token.id;
            const { id } = req.params;

            const response = await ChapterManagementService.soft_delete(creator_id, id);
            res.status(200).json({
                message: "chapter deleted successfully",
                data: {
                    id: response.id,
                    module_id: response.module_id,
                    creator_id: response.creator_id,
                    title: response.title,
                    deleted_at: FormatDate(response.deleted_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async restore(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const creator_id = token.id;
            const { id } = req.params;

            const response = await ChapterManagementService.restore(creator_id, id);
            res.status(200).json({
                message: "chapter restored successfully",
                data: {
                    id: response.id,
                    module_id: response.module_id,
                    creator_id: response.creator_id,
                    title: response.title,
                    updated_at: FormatDate(response.updated_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }
}
