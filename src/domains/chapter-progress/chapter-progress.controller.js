import ChapterProgressValidation from "./chapter-progress.validation.js";
import ChapterProgressService from "./chapter-progress.service.js";
import Validation from "../../utils/Validation.js";
import jwt from "jsonwebtoken";

export default class ChapterProgressController {

    static async findChapterByModuleIsCompleted(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const user_id = token.id;
            const data = await Validation.validate(ChapterProgressValidation.FIND_CHAPTERS, req.body);

            const response = await ChapterProgressService.findChapterByModuleIsCompleted(user_id, data.module_id);
            return res.status(200).json({
                message: "success",
                data: response.map((chapter) => {
                    return {
                        id: chapter.chapter.id,
                        title: chapter.chapter.title,
                        module_id: chapter.chapter.module_id,
                        module_title: chapter.chapter.module.title,
                    }
                })
            });
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });
            
            const user_id = token.id;
            const data = await Validation.validate(ChapterProgressValidation.CREATE, req.body);

            const response = await ChapterProgressService.attempt(user_id, data.module_id, data.chapter_id);
            res.status(201).json({
                message: "chapter has been completed",
                data: response
            })
        } catch (e) {
            next(e);
        }
    }
}
