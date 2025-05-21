import prismaClient from "../../application/database.js";

export default class ModuleManagementRepository {

    static async find_existing_module_by_title_and_creator_id(title, creator_id) {
        return await prismaClient.module.findFirst({
            where: {
                title: title,
                creator_id: creator_id
            }
        });
    }

    static async create(data) {
        return await prismaClient.module.create({
            data: {
                title: data.title,
                description: data.description,
                level: data.level,
                creator_id: data.creator_id
            }
        });
    }

    static async soft_delete(id) {
        return await prismaClient.module.update({
            where: {
                id: id
            },
            data: {
                is_deleted: true
            }
        });
    }

    static async restore(id) {
        return await prismaClient.module.update({
            where: {
                id: id
            },
            data: {
                is_deleted: false
            }
        });
    }

    static async update(data) {
        return await prismaClient.module.update({
            where: {
                id: data.module_id
            },
            data: {
                title: data.title,
                description: data.description,
                level: data.level,
                is_free: data.is_free,
                is_published: data.is_published,
                updated_at: new Date()
            }
        });
    }

    static async update_points_required(id, points_required) {
        return await prismaClient.module.update({
            where: {
                id: id
            },
            data: {
                points_required: points_required
            }
        });
    }

    static async find_by(type, value) {
        if (type === "all") {
            return await prismaClient.module.findMany({
                where: {
                    is_published: true,
                    is_deleted: false
                },
                include: {
                    creator: true,
                    chapters: true
                }
            });
        }

        if (type === "id") {
            return await prismaClient.module.findUnique({
                where: {
                    id: value
                },
                include: {
                    creator: true,
                    chapters: true
                }
            });
        }

        if (type === "title") {
            return await prismaClient.module.findMany({
                where: {
                    title: {
                        contains: value
                    },
                },
                include: {
                    creator: true
                }
            });
        }

        if (type === "creator_id") {
            return await prismaClient.module.findMany({
                where: {
                    creator_id: value
                },
                include: {
                    creator: true
                }
            });
        }

        if (type === "level") {
            return await prismaClient.module.findMany({
                where: {
                    level: value
                },
                include: {
                    creator: true
                }
            });
        }

        if (type === "member_by_module_id") {
            return await prismaClient.module.findUnique({
                where: {
                    id: value
                },
                include: {
                    chapters: true,
                    enrollments: {
                        include: {
                            user: {
                                include: {
                                    chapter_progress: {
                                        include: {
                                            chapter: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }

}
