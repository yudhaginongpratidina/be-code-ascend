// --------------------------------------------------------------------------------
// dependencies
// --------------------------------------------------------------------------------
import express from "express";

// --------------------------------------------------------------------------------
// controllers
// --------------------------------------------------------------------------------
import AuthenticationController from "../domains/authentication/authentication.controller.js";
import UserManagementController from "../domains/user-management/user-management.controller.js";
import ModuleManagementController from "../domains/module-management/module-management.controller.js";
import ChapterManagementController from "../domains/chapter-management/chapter-management.controller.js";
import EnrollmentManagementController from "../domains/enrollment-management/enrollment-management.controller.js";
import ChapterProgressController from "../domains/chapter-progress/chapter-progress.controller.js";
import QuizAttemptController from "../domains/quiz-attempt/quiz-attempt.controller.js";
import LeaderboardController from "../domains/leaderboard/leaderboard.controller.js";
import AccountController from "../domains/account/account.controller.js";

// --------------------------------------------------------------------------------
// middlewares
// --------------------------------------------------------------------------------
import VerifyToken from "../middleware/VerifyTokenMiddleware.js";
import RolePermission from "../middleware/RolePermissionMiddleware.js";
import AuthenticatedMiddleware from "../middleware/AuthenticationMiddleware.js";

// --------------------------------------------------------------------------------
// initialize express
// --------------------------------------------------------------------------------
const api = express.Router();

// --------------------------------------------------------------------------------
// routes - api
// --------------------------------------------------------------------------------
api.post("/auth/register", AuthenticationController.register);
api.post("/auth/login", AuthenticationController.login);
api.get("/auth/token", AuthenticationController.refresh_token);
api.get("/auth/logout", AuthenticationController.logout);


api.get("/account", AuthenticatedMiddleware, AccountController.index);
api.patch("/account", AuthenticatedMiddleware, AccountController.update);


api.get("/users", UserManagementController.index);
api.patch("/users", AuthenticatedMiddleware, RolePermission("superadmin"), UserManagementController.update);
api.post("/users/search", UserManagementController.show);


api.post("/modules", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ModuleManagementController.store);
api.patch("/modules", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ModuleManagementController.update);
api.patch("/modules/:id", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ModuleManagementController.restore);
api.delete("/modules/:id", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ModuleManagementController.destroy);
api.post("/modules/search", ModuleManagementController.index);


api.post("/chapters", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ChapterManagementController.store);
api.patch("/chapters", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ChapterManagementController.update);
api.patch("/chapters/:id", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ChapterManagementController.restore);
api.delete("/chapters/:id", AuthenticatedMiddleware, RolePermission(["contributor", "admin", "superadmin"]), ChapterManagementController.destroy);
api.post("/chapters/search", ChapterManagementController.index);


api.get("/enrollments", AuthenticatedMiddleware, EnrollmentManagementController.index);
api.get("/enrollments/:id", AuthenticatedMiddleware, EnrollmentManagementController.show);
api.post("/enrollments", AuthenticatedMiddleware, EnrollmentManagementController.store);



api.post("/quiz-attempt", VerifyToken, QuizAttemptController.store);
api.post("/quiz-attempt/find", VerifyToken, QuizAttemptController.findAttemptQuiz);

api.post("/chapter-progress", VerifyToken, ChapterProgressController.store);
api.post("/chapter-progress/find-chapters", VerifyToken, ChapterProgressController.findChapterByModuleIsCompleted);

api.post("/leaderboard", VerifyToken, LeaderboardController.index);

// --------------------------------------------------------------------------------
// export default
// --------------------------------------------------------------------------------
export default api;
