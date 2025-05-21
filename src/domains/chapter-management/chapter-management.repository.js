import prismaClient from "../../application/database.js";

export default class ChapterManagementRepository {

    static async create_chapter(creator_id, data) {
        return await prismaClient.chapter.create({
            data: {
                module_id: data.module_id,
                creator_id: creator_id,
                title: data.title,
                content: data.content,
                with_question: data.with_question,
                question: data.question,
                answer_1: data.answer_1,
                answer_2: data.answer_2,
                answer_3: data.answer_3,
                correct_answer: data.correct_answer,
                point_earned: data.point_earned,
                exp_earned: data.exp_earned,
                is_published: data.is_published
            }
        });
    }

    static async update_chapter_by_id(id, data) {
        return await prismaClient.chapter.update({
            where: {
                id: id // Gunakan id sebagai kunci unik
            },
            data: {
                title: data.title,
                content: data.content,
                with_question: data.with_question,
                question: data.question,
                answer_1: data.answer_1,
                answer_2: data.answer_2,
                answer_3: data.answer_3,
                correct_answer: data.correct_answer,
                point_earned: data.point_earned,
                exp_earned: data.exp_earned,
                is_published: data.is_published,
                updated_at: new Date()
            }
        });
    }

    static async find_chapter_by_module_id_and_title(module_id, title) {
        return await prismaClient.chapter.findFirst({
            where: {
                module_id: module_id,
                title: title
            }
        });
    }

    static async find_chapter_by_module_id_and_creator_id(module_id, creator_id) {
        return await prismaClient.chapter.findFirst({
            where: {
                module_id: module_id,
                creator_id: creator_id
            }
        });
    }

    static async find_chapter_by_module_id(module_id) {
        return await prismaClient.chapter.findMany({
            where: {
                module_id: module_id
            }
        });
    }

    static async update_points_required_module(module_id, points_required) {
        return await prismaClient.module.update({
            where: {
                id: module_id
            },
            data: {
                points_required: points_required
            }
        });
    }

    static async count_chapters_by_module(module_id) {
        return await prismaClient.chapter.count({
            where: {
                module_id: module_id,
                is_published: true,
                is_deleted: false
            }
        });
    }

    static async find_by(type, value, creator_id) {
        if (type === "module_id") {
            return await prismaClient.chapter.findMany({
                where: {
                    module_id: value,
                    is_published: true,
                    is_deleted: false
                },
                include: {
                    module: true
                }
            });
        }

        // custom
        if (type === "module_id_enrolled") {
            return await prismaClient.chapter.findMany({
                where: {
                    module_id: value,
                    is_published: true,
                    is_deleted: false
                },
                include: {
                    module: true
                }
            });
        }

        if (type === "id") {
            return await prismaClient.chapter.findUnique({
                where: {
                    id: value
                }
            })
        }

        if (type === "module_id_only_by_creator_id") {
            return await prismaClient.chapter.findMany({
                where: {
                    module_id: value,
                    creator_id: creator_id
                }
            });
        }
    }

    static async soft_delete(id) {
        return await prismaClient.chapter.update({
            where: {
                id: id
            },
            data: {
                is_deleted: true
            }
        });
    }

    static async restore(id) {
        return await prismaClient.chapter.update({
            where: {
                id: id
            },
            data: {
                is_deleted: false
            }
        });
    }

}
