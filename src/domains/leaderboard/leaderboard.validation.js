import { z } from "zod";

export default class LeaderboardValidation {
    static SEARCH = z.object({
        type: z.enum([
            'search_all',
            'search_by_me',
        ]),
    })
}
