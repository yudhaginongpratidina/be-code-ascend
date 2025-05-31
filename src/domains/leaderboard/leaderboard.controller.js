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
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];
                if (!token) return res.status(401).json({ message: "user not logged in" });

                const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                const user_id = decoded.id;

                if (!user_id) {
                    return res.status(401).json({ message: "user not logged in" });
                }

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

    static async create(req, res, next) {
        try {
            res.send("Leaderboard create form");
        } catch (e) {
            next(e);
        }
    }

    static async store(req, res, next) {
        try {
            res.send("Leaderboard stored");
        } catch (e) {
            next(e);
        }
    }

    static async show(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`Leaderboard show ${id}`);
        } catch (e) {
            next(e);
        }
    }

    static async edit(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`Leaderboard edit ${id}`);
        } catch (e) {
            next(e);
        }
    }

    static async update(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`Leaderboard updated ${id}`);
        } catch (e) {
            next(e);
        }
    }

    static async destroy(req, res, next) {
        try {
            const { id } = req.params;
            res.send(`Leaderboard deleted ${id}`);
        } catch (e) {
            next(e);
        }
    }
}
