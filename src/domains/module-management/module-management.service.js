import ChapterManagementRepository from "../chapter-management/chapter-management.repository.js";
import UserManagementRepository from "../user-management/user-management.repository.js";
import ModuleManagementRepository from "./module-management.repository.js";
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


export default class ModuleManagementService {

    static async create(data) {
        const user_exists = await UserManagementRepository.find_by_id(data.creator_id);
        if (!user_exists) throw new ResponseError(404, "user not found");
        const existingModule = await ModuleManagementRepository.find_existing_module_by_title_and_creator_id(data.title, data.creator_id);
        if (existingModule) throw new ResponseError(409, "you have already created this module");
        return await ModuleManagementRepository.create(data);
    }

    static async search_by(type, value) {
        if (type === "all"){
            return await ModuleManagementRepository.find_by("all");
        }

        if (type === "title"){
            const modules = await ModuleManagementRepository.find_by("title", value);
            if (modules.length === 0) throw new ResponseError(404, "module not found");
            return modules;
        }
        
        if (type === "creator_id"){
            return await ModuleManagementRepository.find_by("creator_id", value);
        }
        
        if (type === "level"){
            return await ModuleManagementRepository.find_by("level", value);
        }

        if (type === "id"){
            const module = await ModuleManagementRepository.find_by("id", value);
            if (!module) throw new ResponseError(404, "module not found");
            return module;
        }

        if (type === "me"){
            return await ModuleManagementRepository.find_by("creator_id", value);
        }

        if (type === "member_by_module_id"){
            return await ModuleManagementRepository.find_by("member_by_module_id", value);
        }
    }

    static async update(creator_id, data) {
        // Cari modul berdasarkan ID
        const module = await ModuleManagementRepository.find_by("id", data.module_id);
        
        if (!module) { throw new ResponseError(404, "Module not found"); }
        if (module.creator_id !== creator_id) { throw new ResponseError(403, "You are not the creator of this module"); }
    
        // Cek apakah ada modul lain dengan judul yang sama milik creator yang sama
        const existingModule = await ModuleManagementRepository.find_existing_module_by_title_and_creator_id(data.title, creator_id);
    
        // Jika ada modul lain (dengan judul sama), dan itu bukan modul yang sedang diupdate, maka error
        if (existingModule && existingModule.id !== module.id) {
            throw new ResponseError(409, "You have already created another module with this title");
        }
    
        // Lanjut update
        const updated = await ModuleManagementRepository.update(data);
    
        // Cari total chapter yang terhubung dengan modul ini
        const find_chapters = await ChapterManagementRepository.find_by("module_id", data.module_id);
        if (find_chapters.length > 0) {
            // Tampung seluruh id chapter
            const chapter_ids = find_chapters.map(chapter => chapter.id);
    
            // Hitung ulang earn point dan xp berdasarkan level modul yang diperbarui
            const points = calculateEarnPoints(updated.level);
            const xp = calculateEarnXP(updated.level);
    
            // Update point dan xp untuk setiap chapter
            for (const chapter_id of chapter_ids) {
                await ChapterManagementRepository.update_chapter_by_id(chapter_id, {
                    point_earned: points,
                    exp_earned: xp // Pastikan xp_earned juga diperbarui
                });
            }
        }
    
        return updated;
    }


    static async delete(creator_id, id) {
        const module = await ModuleManagementRepository.find_by("id", id);
        if (!module) { throw new ResponseError(404, "Module not found"); }
        if (module.creator_id !== creator_id) { throw new ResponseError(403, "You are not the creator of this module"); }
        return await ModuleManagementRepository.soft_delete(id);
    }

    static async restore(creator_id, id) {
        const module = await ModuleManagementRepository.find_by("id", id);
        if (!module) { throw new ResponseError(404, "Module not found"); }
        if (module.creator_id !== creator_id) { throw new ResponseError(403, "You are not the creator of this module"); }
        return await ModuleManagementRepository.restore(id);
    }
    
}
