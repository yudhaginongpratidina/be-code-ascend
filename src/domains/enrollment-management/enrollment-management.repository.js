import prismaClient from "../../application/database.js";

export default class EnrollmentManagementRepository {

    static async find_module_by_id(module_id) {
        return await prismaClient.module.findUnique({
            where: {
                id: module_id
            }
        });
    }

    static async check_enrollment(user_id, module_id) {
        return await prismaClient.enrollment.findUnique({
            where: {
                user_id_module_id: {
                    user_id: user_id,
                    module_id: module_id
                }
            }
        });

    }

    static async decrease_points(user_id, points) {
        return await prismaClient.user.update({
            where: {
                id: user_id
            },
            data: {
                point: {
                    decrement: points
                }
            }
        });
    }

    static async enroll_module(user_id, module_id) {
        return await prismaClient.enrollment.create({
            data: {
                user_id: user_id,
                module_id: module_id
            },
            include: {
                user: true,
                module: true
            }
        });
    }

    static async find_enrollment_by_me(user_id) {
        return await prismaClient.enrollment.findMany({
            where: {
                user_id: user_id
            },
            include: {
                user: true,
                module: {
                    include: {
                        chapters : {
                            where: {
                                is_published: true,
                                is_deleted: false
                            }
                        }
                    }
                }
            }
        });
    }

    static async find_detail_enrollment(user_id, module_id) {
        return await prismaClient.enrollment.findUnique({
            where: {
                user_id_module_id: {
                    user_id: user_id,
                    module_id: module_id
                }
            },
            include: {
                user: true,
                module: {
                    include: {
                        creator: true,
                        chapters: {
                            where: {
                                is_published: true,
                                is_deleted: false
                            }
                        }
                    }
                }
            }
        });
    }

}
