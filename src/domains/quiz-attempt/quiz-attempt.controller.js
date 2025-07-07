import QuizAttemptValidation from "./quiz-attempt.validation.js";
import Validation from "../../utils/Validation.js";
import jwt from "jsonwebtoken";
import QuizAttemptService from "./quiz-attempt.service.js";

export default class QuizAttemptController {

    static async findAttemptQuiz(req, res, next) {
        try {
            const token = req.token;
            if (!token) return res.status(401).json({ message: "user not logged in" });

            const user_id = token.id;
            const data = await Validation.validate(QuizAttemptValidation.FIND, req.body);

            const response = await QuizAttemptService.findAttemptQuiz(user_id, data.chapter_id);
            return res.status(200).json({
                message: "success",
                data: response
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
            const data = await Validation.validate(QuizAttemptValidation.CREATE, req.body);

            const response = await QuizAttemptService.attempt(user_id, data.module_id, data.chapter_id, data.answer);
            res.status(201).json({
                message: "That's the right answer—good work!",
                data: response
            })
        } catch (e) {
            next(e);
        }
    }
}
