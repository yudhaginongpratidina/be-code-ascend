import prismaClient from "../../application/database.js";

export default class ChapterProgressRepository {

    static async attempt(user_id, chapter_id) {
        return await prismaClient.chapterProgress.create({
            data: {
                user_id: user_id,
                chapter_id: chapter_id
            }
        });
    }

    static async findAttemptChapter(user_id, chapter_id) {
        return await prismaClient.chapterProgress.findFirst({
            where: {
                user_id: user_id,
                chapter_id: chapter_id
            }
        });
    }

    static async findChaptersByModuleIsCompleted(user_id) {
        return await prismaClient.chapterProgress.findMany({
            where: {
                user_id: user_id,
            },
            include: {
                chapter: {
                    include: {
                        module: true
                    }
                }
            }
        });
    }

    static async findAttemptQuiz(user_id, chapter_id) {
        return await prismaClient.quizAttempt.findFirst({
            where: {
                user_id: user_id,
                chapter_id: chapter_id
            }
        });
    }

    static update_exp_user(user_id, exp) {
        return prismaClient.user.update({
            where: {
                id: user_id
            },
            data: {
                experience: {
                    increment: exp
                }
            }
        });
    }

}
