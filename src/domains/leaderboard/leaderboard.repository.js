import prismaClient from "../../application/database.js";

export default class LeaderboardRepository {

    static async getLeaderboard() {
        return await prismaClient.user.findMany({
            orderBy: {
                experience: "desc"
            }
        })
    }

    static async getMyRank(user_id) {
        return await prismaClient.user.findUnique({
            where: {
                id: user_id
            }
        })
    }

}
