import UserRepository from "../user-management/user-management.repository.js";
import EnrollmentManagementRepository from "../enrollment-management/enrollment-management.repository.js";
import ChapterManagementRepository from "../chapter-management/chapter-management.repository.js";
import QuizAttemptRepository from "./quiz-attempt.repository.js";
import ResponseError from "../../utils/ResponseError.js";

export default class QuizAttemptService {

    static async attempt(user_id, module_id, chapter_id, answer) {
        // 01 - memastikan data user ada di database
        const user = await UserRepository.find_by_id(user_id);
        if (!user) throw new ResponseError(404, "user not found");

        // 02 - memastikan bahwa user telah enroll module tersebut
        const module_enrolled = await EnrollmentManagementRepository.check_enrollment(user_id, module_id);
        if (!module_enrolled) throw new ResponseError(404, "You haven't enrolled in this module");

        // 03 - memastikan bahwa chapter tersebut ada
        const chapter_exist = await ChapterManagementRepository.find_by("id", chapter_id);
        if (!chapter_exist) throw new ResponseError(404, "chapter not found");

        // 04 - memastikan bahwa chapter tersebut bagian dari module tersebut
        if (chapter_exist.module_id !== module_id) throw new ResponseError(404, "chapter not found in this module");

        // 05 - memastikan bahwa chapter tersebut with_question nya true
        if (chapter_exist.with_question === false) throw new ResponseError(404, "chapter not with question");

        // 06 - cek apakah user telah mengerjakan quiz nya atau belum
        const cek_attempt = await QuizAttemptRepository.findAttemptQuiz(user_id, chapter_id);
        if (cek_attempt) throw new ResponseError(409, "you have already done this quiz");

        // 07 - cek apakah jawaban dari user itu sama dengan jawaban yang benar
        if (answer !== chapter_exist.correct_answer) throw new ResponseError(400, "wrong answer");

        // 08 - attempt
        const attempt = await QuizAttemptRepository.attempt(user_id, chapter_id);

        // 09 - update point user
        await QuizAttemptRepository.update_point_user(user_id, chapter_exist.point_earned);
        return attempt;
    }

    static async findAttemptQuiz(user_id, chapter_id) {
        const attempt = await QuizAttemptRepository.findAttemptQuiz(user_id, chapter_id);
        return attempt;
    }

}
