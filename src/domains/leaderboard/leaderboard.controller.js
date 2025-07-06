import LeaderboardValidation from "./leaderboard.validation.js";
import LeaderboardService from "./leaderboard.service.js";
import Validation from "../../utils/Validation.js";
import jwt from "jsonwebtoken";

export default class LeaderboardController {
    static async index(req, res, next) {
        try {
            const data = await Validation.validate(LeaderboardValidation.SEARCH, req.body);

            if (data.type === "search_all") {
                const response = await LeaderboardService.getLeaderboard();
                res.status(200).json({
                    message: "Successfully obtained leaderboard data",
                    data: response.map((leaderboard) => {
                        return {
                            id: leaderboard.id,
                            name: leaderboard.full_name,
                            experience: leaderboard.experience
                        }
                    })
                })
            }

            if (data.type === "search_by_me") {
                const token = req.token;
                if (!token) return res.status(401).json({ message: "user not logged in" });

                const user_id = token.id;
                const response = await LeaderboardService.getMyRank(user_id);
                res.status(200).json({
                    message: "Successfully obtained leaderboard data",
                    data: response
                })
            }

        } catch (e) {
            next(e);
        }
    }
}
