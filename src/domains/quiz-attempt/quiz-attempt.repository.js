import prismaClient from "../../application/database.js";

export default class QuizAttemptRepository {

    static async findAttemptQuiz(user_id, chapter_id) {
        return await prismaClient.quizAttempt.findFirst({
            where: {
                user_id: user_id,
                chapter_id: chapter_id
            }
        });
    }

    static async attempt(user_id, chapter_id) {
        return await prismaClient.quizAttempt.create({
            data: {
                user_id: user_id,
                chapter_id: chapter_id
            }
        });
    }

    static async update_point_user(user_id, point) {
        return await prismaClient.user.update({
            where: {
                id: user_id
            },
            data: {
                point: point
            }
        });
    }


}
