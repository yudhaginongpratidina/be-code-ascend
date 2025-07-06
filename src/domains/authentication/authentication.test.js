import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("AuthenticationController", () => {

    beforeAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.create({
            data: {
                full_name: "user deleted",
                username: "user_deleted",
                email: "user@deleted.com",
                password: bcrypt.hashSync('user@deleted.com', 10),
                role: "user",
                deleted_at: new Date()
            }
        });
    });

    afterAll(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    describe("test register", () => {

        it("should return a 400 status code if fields are empty", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "",
                username: "",
                email: "",
                password: "",
                confirm_password: ""
            });
            expect(response.status).toBe(400);
        })

        it("should return a 400 status code when username is invalid", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "user test 1",
                username: "user test1",
                email: "user1@test.com",
                password: "user1@test.com",
                confirm_password: "user1@test.com"
            });
            expect(response.status).toBe(400);
            expect(response.body.data[0].message).toBe("Username can only contain letters, numbers, and underscores");
        })

        it("should return a 400 status code if password and confirm password are not the same", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "user test 1",
                username: "user_test1",
                email: "user1@test.com",
                password: "user1@test.com",
                confirm_password: "user1@wrong.com"
            });
            expect(response.status).toBe(400);
            expect(response.body.data[0].message).toBe("Passwords do not match");
        })

        it("should return a 201 status code when user is registered successfully", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "user test 1",
                username: "user_test_1",
                email: "user1@test.com",
                password: "user1@test.com",
                confirm_password: "user1@test.com"
            });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("user registered successfully");
            expect(response.body.data.full_name).toBe("user test 1");
            expect(response.body.data.username).toBe("user_test_1");
            expect(response.body.data.email).toBe("user1@test.com");
            expect(response.body.data.role).toBe("user");
            expect(response.body.data.point).toBe(50);
            expect(response.body.data.experience).toBe(0);
            expect(response.body.data.created_at).toBeDefined();
        })

        it("should return a 409 status code when user register use username that has been registered", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "user test 1",
                username: "user_test_1",
                email: "user1@test.com",
                password: "user1@test.com",
                confirm_password: "user1@test.com"
            });
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("Username has been registered");
        })

        it("should return a 409 status code when user register use email that has been registered", async () => {
            const response = await request(api).post('/auth/register').send({
                full_name: "user test 1",
                username: "user_test_12",
                email: "user1@test.com",
                password: "user1@test.com",
                confirm_password: "user1@test.com"
            });
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("Email has been registered");
        })

    });

    describe("test login", () => {

        it("should return a 404 status code if user is not found when login with email", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "not_found@test.com",
                password: "not_found@test.com"
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("user not found");
        })

        it("should return a 404 status code if user is not found when login with username", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_username",
                username: "user_not_found",
                password: "not_found@test.com"
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("user not found");
        })

        it("should return a 200 status code if user login with email", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user1@test.com",
                password: "user1@test.com"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("user logged in successfully");
            expect(response.body.data.token).toBeDefined();
        })

        it("should return a 200 status code if user login with username", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_username",
                username: "user_test_1",
                password: "user1@test.com"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("user logged in successfully");
            expect(response.body.data.token).toBeDefined();
        })

        it("should return a 401 status code if password is wrong when user login with username", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_username",
                username: "user_test_1",
                password: "wrong_password"
            });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe("wrong password");
        })

        it("should return a 401 status code if password is wrong when user login with username", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_username",
                username: "user_test_1",
                password: "wrong_password"
            });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe("wrong password");
        })

        it("should return a 403 status code if when user login with username, but account has been deleted", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_username",
                username: "user_deleted",
                password: "user@deleted.com"
            });
            expect(response.status).toBe(403);
            expect(response.body.message).toBe("This account was deleted... but not permanently. Restoration is possible");
        })

        it("should return a 403 status code if when user login with email, but account has been deleted", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@deleted.com",
                password: "user@deleted.com"
            });
            expect(response.status).toBe(403);
            expect(response.body.message).toBe("This account was deleted... but not permanently. Restoration is possible");
        })
    });

    // describe("test get redresh token", () => {
    //     it("should refresh token successfully", async () => {
    //         const loginResponse = await request(api).post("/auth/login").send({
    //             type: "login_with_username",
    //             username: "user_test_1",
    //             password: "user1@test.com"
    //         });
    //         const cookies = loginResponse.headers["set-cookie"];
    //         const response = await request(api).get("/auth/token").set("Cookie", cookies);
    //         expect(response.status).toBe(200);
    //         expect(response.body.message).toBe("Token refreshed successfully");
    //         expect(response.body.data.token).toBeDefined();
    //     });

    //     it("should return 401 if no refresh token is provided", async () => {
    //         const response = await request(api).get("/auth/token");
    //         expect(response.status).toBe(401);
    //     });
    // });

    // describe("test logout", () => {
    //     it("should return a 200 status code if user login successfully", async () => {
    //         const loginResponse = await request(api).post("/auth/login").send({
    //             type: "login_with_username",
    //             username: "user_test_1",
    //             password: "user1@test.com"
    //         });
    //         const cookies = loginResponse.headers["set-cookie"];
    //         const response = await request(api).get("/auth/logout").set("Cookie", cookies);
    //         expect(response.status).toBe(200);
    //         expect(response.body.message).toBe("Logout success");
    //     });

    //     it("should return 401 if user is not logged in", async () => {
    //         const response = await request(api).get("/auth/logout");
    //         expect(response.status).toBe(401);
    //         expect(response.body.message).toBe("user not logged in");
    //     });
    // });
});
