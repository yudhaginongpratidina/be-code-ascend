import ModuleManagementValidation from "./module-management.validation.js";
import ModuleManagementService from "./module-management.service.js";
import { decodeToken } from "../../utils/JsonWebToken.js";
import Validation from "../../utils/Validation.js";
import FormatDate from "../../utils/FormatDate.js";

export default class ModuleManagementController {
    static async index(req, res, next) {
        try {
            const data = await Validation.validate(ModuleManagementValidation.SEARCH, req.body);

            if (data.type === "search_all") {
                const response = await ModuleManagementService.search_by("all");
                res.status(200).json({
                    message: "modules found",
                    data: response.map((module) => ({
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        level: module.level,
                        points_required: module.points_required,
                        author: {
                            id: module.creator.id,
                            name: module.creator.full_name
                        },
                        free: module.is_free,
                        chapter_count: module.chapters.length,
                        created_at: FormatDate(module.created_at),
                        updated_at: FormatDate(module.updated_at)
                    }))
                });
            }

            if (data.type === "search_by_title") {
                const response = await ModuleManagementService.search_by("title", data.value);
                res.status(200).json({
                    message: "modules found",
                    data: response.map((module) => ({
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        level: module.level,
                        points_required: module.points_required,
                        author: {
                            id: module.creator.id,
                            name: module.creator.full_name
                        },
                        free: module.is_free,
                        created_at: FormatDate(module.created_at),
                        updated_at: FormatDate(module.updated_at)
                    }))
                });
            }

            if (data.type === "search_by_creator_id") {
                const response = await ModuleManagementService.search_by("creator_id", data.value);
                res.status(200).json({
                    message: "modules found",
                    data: response.map((module) => ({
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        level: module.level,
                        points_required: module.points_required,
                        author: {
                            id: module.creator.id,
                            name: module.creator.full_name
                        },
                        free: module.is_free,
                        created_at: FormatDate(module.created_at),
                        updated_at: FormatDate(module.updated_at)
                    }))
                });
            }

            if (data.type === "search_by_level") {
                const response = await ModuleManagementService.search_by("level", data.value);
                res.status(200).json({
                    message: "modules found",
                    data: response.map((module) => ({
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        level: module.level,
                        points_required: module.points_required,
                        author: {
                            id: module.creator.id,
                            name: module.creator.full_name
                        },
                        free: module.is_free,
                        created_at: FormatDate(module.created_at),
                        updated_at: FormatDate(module.updated_at)
                    }))
                });
            }

            if (data.type === "search_by_me") {
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                if (!token) return res.status(401).json({ message: "user not logged in" });

                const decoded = decodeToken(token);
                const id = decoded.id;

                const response = await ModuleManagementService.search_by("me", id);
                res.status(200).json({
                    message: "modules found",
                    data: response.map((module) => ({
                        id: module.id,
                        title: module.title,
                        description: module.description,
                        level: module.level,
                        points_required: module.points_required,
                        is_published: module.is_published,
                        author: {
                            id: module.creator.id,
                            name: module.creator.full_name
                        },
                        is_free: module.is_free,
                        created_at: FormatDate(module.created_at),
                        updated_at: FormatDate(module.updated_at),
                        is_deleted: module.is_deleted
                    }))
                });
            }

            if (data.type === "search_by_id") {
                const response = await ModuleManagementService.search_by("id", data.value);
                res.status(200).json({
                    message: "modules found",
                    data: {
                        id: response.id,
                        title: response.title,
                        description: response.description,
                        level: response.level,
                        point_required: response.points_required,
                        author: {
                            id: response.creator.id,
                            name: response.creator.full_name
                        },
                        free: response.is_free,
                        is_published: response.is_published,
                        chapter_count: response.chapters.length,
                        created_at: FormatDate(response.created_at),
                        updated_at: FormatDate(response.updated_at)
                    }
                });
            }

            if (data.type === "search_member_by_module_id") {
                const response = await ModuleManagementService.search_by("member_by_module_id", data.value);
                const publishedChapters = Array.isArray(response.chapters)
                    ? response.chapters.filter(ch => ch.is_published && !ch.is_deleted)
                    : [];
                const totalPublishedChapters = publishedChapters.length;

                res.status(200).json({
                    message: "modules found",
                    data: {
                        id: response.id,
                        title: response.title,
                        level: response.level,
                        total_published_chapters: totalPublishedChapters,
                        users: Array.isArray(response.enrollments) ? response.enrollments.map((enrollment) => {
                            const completedChapterIds = Array.isArray(enrollment.user.chapter_progress)
                                ? enrollment.user.chapter_progress
                                    .filter(cp =>
                                        cp.chapter &&
                                        cp.chapter.module_id === response.id &&
                                        cp.chapter.is_published &&
                                        !cp.chapter.is_deleted
                                    )
                                    .map(cp => cp.chapter.id)
                                : [];

                            return {
                                id: enrollment.user.id,
                                name: enrollment.user.full_name,
                                completed_chapters_count: completedChapterIds.length,
                                completed_chapters: publishedChapters
                                    .filter(ch => completedChapterIds.includes(ch.id))
                                    .map(ch => ({
                                        id: ch.id,
                                        title: ch.title
                                    })),
                                completed_chapters_summary: `${completedChapterIds.length} of ${totalPublishedChapters} chapters`
                            };
                        }) : []
                    }
                });
            }
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            const token = req.token
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const data = await Validation.validate(ModuleManagementValidation.CREATE, req.body);
            data.creator_id = token.id;

            const response = await ModuleManagementService.create(data);
            res.status(201).json({
                message: "module created successfully",
                data: {
                    id: response.id,
                    title: response.title,
                    description: response.description,
                    level: response.level,
                    creator_id: response.creator_id,
                    created_at: FormatDate(response.created_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async update(req, res, next) {
        try {
            const token = req.token
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const creator_id = token.id;
            const data = await Validation.validate(ModuleManagementValidation.UPDATE, req.body);

            const response = await ModuleManagementService.update(creator_id, data);
            res.status(200).json({
                message: "module updated successfully",
                data: {
                    id: response.id,
                    title: response.title,
                    description: response.description,
                    level: response.level,
                    is_free: response.is_free,
                    is_published: response.is_published,
                    creator_id: response.creator_id,
                    updated_at: FormatDate(response.updated_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }

    static async restore(req, res, next) {
        try {
            const token = req.token
            const { id } = req.params;

            const creator_id = token.id;
            const response = await ModuleManagementService.restore(creator_id, id);
            
            res.status(200).json({
                message: "module restored successfully",
                data: {
                    id: response.id,
                    title: response.title,
                    description: response.description,
                    level: response.level,
                    is_free: response.is_free,
                    is_published: response.is_published,
                    creator_id: response.creator_id,
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
            const creator_id = token.id;

            const { id } = req.params;
            const response = await ModuleManagementService.delete(creator_id, id);
            res.status(200).json({
                message: "module deleted successfully",
                data: {
                    id: response.id,
                    title: response.title,
                    description: response.description,
                    level: response.level,
                    is_free: response.is_free,
                    is_published: response.is_published,
                    creator_id: response.creator_id,
                    deleted_at: FormatDate(response.deleted_at)
                }
            });
        } catch (e) {
            next(e);
        }
    }
}
