import UserRepository from "../user-management/user-management.repository.js";
import EnrollmentManagementRepository from "../enrollment-management/enrollment-management.repository.js";
import ChapterManagementRepository from "../chapter-management/chapter-management.repository.js";
import ChapterProgressRepository from "./chapter-progress.repository.js";
import ResponseError from "../../utils/ResponseError.js";

export default class ChapterProgressService {

    static async attempt(user_id, module_id, chapter_id) {
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

        // 05 - cek apakah chapter tersebut with_question nya true atau tidak
        if (chapter_exist.with_question === false){
            // jika false, maka cek apakah user telah menyelesaikan chapter tersebut
            const cek_attempt = await ChapterProgressRepository.findAttemptChapter(user_id, chapter_id);
            if (cek_attempt) throw new ResponseError(409, "This chapter has already been marked as completed");

            const attempt = await ChapterProgressRepository.attempt(user_id, chapter_id);

            // update exp user
            await ChapterProgressRepository.update_exp_user(user_id, chapter_exist.exp_earned);
            return attempt;
        } else {
            // cek apakah user telah mengerjakan quiz nya atau belum
            const cek_attempt = await ChapterProgressRepository.findAttemptQuiz(user_id, chapter_id);
            if (!cek_attempt) throw new ResponseError(400, "You haven't finished the quiz yet");

            const attempt = await ChapterProgressRepository.attempt(user_id, chapter_id);

            // update exp user
            await ChapterProgressRepository.update_exp_user(user_id, chapter_exist.exp_earned);
            return attempt;
        }
    }

    static async findChapterByModuleIsCompleted(user_id, module_id) {
        // 01 - memastikan data user ada di database
        const user = await UserRepository.find_by_id(user_id);
        if (!user) throw new ResponseError(404, "user not found");

        // 02 - memastikan bahwa user telah enroll module tersebut
        const module_enrolled = await EnrollmentManagementRepository.check_enrollment(user_id, module_id);
        if (!module_enrolled) throw new ResponseError(404, "You haven't enrolled in this module");

        // 03 - ambil semua chapter yang telah diselesaikan oleh user
        const chapters = await ChapterProgressRepository.findChaptersByModuleIsCompleted(user_id);

        // 04 filter chapter yang sesuai dengan module_id
        const filtered_chapters = chapters.filter(chapter => chapter.chapter.module_id === module_id);
        return filtered_chapters
    }

}
