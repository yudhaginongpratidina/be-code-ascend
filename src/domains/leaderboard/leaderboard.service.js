import LeaderboardRepository from "./leaderboard.repository.js";

export default class LeaderboardService {

    static async getLeaderboard() {
        const leaderboard = await LeaderboardRepository.getLeaderboard();
        return leaderboard;
    }

    static async getMyRank(user_id) {
        const leaderboard = await LeaderboardRepository.getLeaderboard();
        const myRank = await LeaderboardRepository.getMyRank(user_id);
        
        // cari rank saya
        const myRankIndex = leaderboard.findIndex((user) => user.id === myRank.id);
        return myRankIndex + 1;
    }

}
