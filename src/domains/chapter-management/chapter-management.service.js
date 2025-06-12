import UserRepository from "../user-management/user-management.repository.js";
import ModuleManagementRepository from "../module-management/module-management.repository.js";
import ChapterManagementRepository from "./chapter-management.repository.js";
import ResponseError from "../../utils/ResponseError.js";

//  calculate earn point module when user create chapter and when user update chapter
// this earn point can be obtained when the user successfully completes the quiz.
function calculateEarnPoints(level) {
    const basePoints = process.env.EARN_POINT_BASE_POINT;
    const multipliers = {
        beginner: process.env.MULTIPLITER_BEGINNER,
        intermediate: process.env.MULTIPLITER_INTERMEDIATE,
        advanced: process.env.MULTIPLITER_ADVANCED
    };

    return basePoints * multipliers[level];
}

//  calculate earn exp module when user create chapter and when user update chapter
// this earn exp can be obtained when the user successfully completes the chapter.
function calculateEarnXP(level) {
    const baseXP = process.env.EARN_POINT_BASE_XP;
    const multipliers = {
        beginner: process.env.MULTIPLITER_BEGINNER,
        intermediate: process.env.MULTIPLITER_INTERMEDIATE,
        advanced: process.env.MULTIPLITER_ADVANCED
    };

    return baseXP * multipliers[level];
}

const baseCost = Number(process.env.BASE_COST_PER_CHAPTER) || 10;

export default class ChapterManagementService {

    static async create_chapter(creator_id, data) {
        // search user
        const user_exists = await UserRepository.find_by_id(creator_id);
        if (!user_exists) throw new ResponseError(404, "user not found");

        // search module
        const module_exists = await ModuleManagementRepository.find_by("id", data.module_id);
        if (!module_exists) throw new ResponseError(404, "module not found");

        // search chapter
        const chapter_exists = await ChapterManagementRepository.find_chapter_by_module_id_and_title(data.module_id, data.title);
        if (chapter_exists) throw new ResponseError(409, "chapter already exists");

        // calculate earn points and xp base on level module
        const points = calculateEarnPoints(module_exists.level);
        const xp = calculateEarnXP(module_exists.level);

        // create chapter
        const create_chapter = await ChapterManagementRepository.create_chapter(creator_id, {
            module_id: data.module_id,
            title: data.title,
            content: data.content,
            with_question: data.with_question,
            question: data.question,
            answer_1: data.answer_1,
            answer_2: data.answer_2,
            answer_3: data.answer_3,
            correct_answer: data.correct_answer,
            point_earned: points,
            exp_earned: xp,
            is_published: data.is_published
        });

        // let point multipliers
        let point_multipliers = 0
        if (module_exists.level === "beginner") {
            point_multipliers = process.env.MULTIPLITER_BEGINNER;
        } else if (module_exists.level === "intermediate") {
            point_multipliers = process.env.MULTIPLITER_INTERMEDIATE;
        } else if (module_exists.level === "advanced") {
            point_multipliers = process.env.MULTIPLITER_ADVANCED;
        }

        // update points required module
        const chapters_count = await ChapterManagementRepository.count_chapters_by_module(data.module_id);
        const points_required = chapters_count * baseCost * point_multipliers;
        await ChapterManagementRepository.update_points_required_module(data.module_id, points_required);

        return create_chapter
    }

    static async update_chapter_by_module_id(creator_id, data) {
        // Cek user
        const user_exists = await UserRepository.find_by_id(creator_id);
        if (!user_exists) throw new ResponseError(404, "User not found");
    
        // Cek module
        const module_exists = await ModuleManagementRepository.find_by("id", data.module_id);
        if (!module_exists) throw new ResponseError(404, "Module not found");
    
        // Cek chapter apakah ada atau tidak berdasarkan id
        const existing_chapter = await ChapterManagementRepository.find_by("id", data.id, creator_id);
        if (!existing_chapter) throw new ResponseError(404, "Chapter not found");
    
        // Pastikan user adalah pemilik chapter
        if (existing_chapter.creator_id !== creator_id) {
            throw new ResponseError(403, "You are not the creator of this chapter");
        }
    
        // Jika judul baru beda dari yang lama, cek apakah sudah dipakai
        if (data.title !== existing_chapter.title) {
            const chapter_exists = await ChapterManagementRepository.find_chapter_by_module_id_and_title(data.module_id, data.title);
            if (chapter_exists) {
                throw new ResponseError(409, "A chapter with this title already exists in the module");
            }
        }
    
        // Hitung ulang point dan XP
        const points = calculateEarnPoints(module_exists.level);
        const xp = calculateEarnXP(module_exists.level);
    
        // Lakukan update menggunakan id
        const updated = await ChapterManagementRepository.update_chapter_by_id(existing_chapter.id, {
            title: data.title,
            content: data.content,
            with_question: data.with_question,
            question: data.question,
            answer_1: data.answer_1,
            answer_2: data.answer_2,
            answer_3: data.answer_3,
            correct_answer: data.correct_answer,
            point_earned: points,
            exp_earned: xp,
            is_published: data.is_published
        });
    
        // Hitung ulang points_required untuk modul
        const chapters_count = await ChapterManagementRepository.count_chapters_by_module(data.module_id);
        const point_multipliers = {
            beginner:  process.env.MULTIPLITER_BEGINNER,
            intermediate: process.env.MULTIPLITER_INTERMEDIATE,
            advanced: process.env.MULTIPLITER_ADVANCED
        };
        const multiplier = point_multipliers[module_exists.level] || 1;
        const points_required = chapters_count * baseCost * multiplier;
    
        // Update points_required modul
        await ChapterManagementRepository.update_points_required_module(data.module_id, points_required);
    
        return updated;
    }

    static async find_by(type, value, creator_id) {
        if (type === "module_id") {
            const chapters = await ChapterManagementRepository.find_by("module_id", value);
            return chapters;
        }

        if (type === "module_id_enrolled") {
            const chapters = await ChapterManagementRepository.find_by("module_id_enrolled", value);
            return chapters;
        }

        if (type === "id") {
            // cek apakah chapter nya ada
            const chapter = await ChapterManagementRepository.find_by("id", value);
            if (!chapter) throw new ResponseError(404, "chapter not found");
            return chapter
        }

        if (type === "id_only_by_creator_id") {
            // cek apakah chapter nya ada
            const chapter = await ChapterManagementRepository.find_by("id", value);
            if (!chapter) throw new ResponseError(404, "chapter not found");

            // cek apakah user adalah pemilik chapter
            if (chapter.creator_id !== creator_id) throw new ResponseError(401, "You're not the creator of this chapter");
            return chapter
        }

        if (type === "module_id_only_by_creator_id") {
            const chapters = await ChapterManagementRepository.find_by("module_id_only_by_creator_id", value, creator_id);
            return chapters
        }
    }

    static async soft_delete(creator_id, id) {
        // cek apakah chapter nya ada
        const chapter = await ChapterManagementRepository.find_by("id", id); // Tambahkan await
        if (!chapter) throw new ResponseError(404, "chapter not found");

        // cek apakah user adalah pemilik chapter
        if (chapter.creator_id !== creator_id) throw new ResponseError(401, "You're not the creator of this chapter");
        const deleted = await ChapterManagementRepository.soft_delete(id);

        // update points required module
        const module_id = chapter.module_id;

        // search data module
        const module_exists = await ModuleManagementRepository.find_by("id", module_id);
        if (!module_exists) throw new ResponseError(404, "Module not found");

        // let point multipliers
        let point_multipliers = 0
        if (module_exists.level === "beginner") {
            point_multipliers = process.env.MULTIPLITER_BEGINNER;
        } else if (module_exists.level === "intermediate") {
            point_multipliers = process.env.MULTIPLITER_INTERMEDIATE;
        } else if (module_exists.level === "advanced") {
            point_multipliers = process.env.MULTIPLITER_ADVANCED;
        }

        const chapters_count = await ChapterManagementRepository.count_chapters_by_module(module_id);
        const points_required = chapters_count * baseCost * point_multipliers;
        await ChapterManagementRepository.update_points_required_module(module_id, points_required);

        return deleted
    }

    static async restore(creator_id, id) {
        // cek apakah chapter nya ada
        const chapter = await ChapterManagementRepository.find_by("id", id); // Tambahkan await
        if (!chapter) throw new ResponseError(404, "chapter not found");

        // cek apakah user adalah pemilik chapter
        if (chapter.creator_id !== creator_id) throw new ResponseError(401, "You're not the creator of this chapter");
        const restored = await ChapterManagementRepository.restore(id);

        // update points required module
        const module_id = chapter.module_id;

        // search data module
        const module_exists = await ModuleManagementRepository.find_by("id", module_id);
        if (!module_exists) throw new ResponseError(404, "Module not found");

        // let point multipliers
        let point_multipliers = 0
        if (module_exists.level === "beginner") {
            point_multipliers = process.env.MULTIPLITER_BEGINNER;
        } else if (module_exists.level === "intermediate") {
            point_multipliers = process.env.MULTIPLITER_INTERMEDIATE;
        } else if (module_exists.level === "advanced") {
            point_multipliers = process.env.MULTIPLITER_ADVANCED;
        }

        const chapters_count = await ChapterManagementRepository.count_chapters_by_module(module_id);
        const points_required = chapters_count * baseCost * point_multipliers;
        await ChapterManagementRepository.update_points_required_module(module_id, points_required);

        return restored
    }

}
