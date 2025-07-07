import prismaClient from "../../application/database.js";
import request from "supertest";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("AccountController", () => {
    beforeAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.create({
            data: {
                full_name: "user user",
                username: "user_user",
                email: "user@user.com",
                password: bcrypt.hashSync('user@user.com', 10),
                role: "user"
            },
        })
    });

    afterAll(async () => {
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let token = "";


    describe("test get account (profile)", () => {
        it("should return a 200 status code when get account successfully (status user is logged in)", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "user@user.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;

            const response = await request(api).get(`/account`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully obtained user data");
        });
    });

    describe("test update account", () => {
        it("should return a 200 status code when update account successfully", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "user@user.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;

            const response = await request(api).patch(`/account`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "update_password",
                    old_password: "user@user.com",
                    new_password: "update@user.com",
                    confirm_password: "update@user.com"
                })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully updated user password");
        });

        it("should return a 401 status code when user login with old password", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "user@user.com"
            });
            expect(response.status).toBe(401);
            expect(response.body.message).toBe("wrong password");
        })

        it("should return a 200 status code when user login with new password", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "update@user.com"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("user logged in successfully");
        })
    });

    describe("test update details information", () => {
        it("should return a 200 status code when user update details information", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "update@user.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();
            token = login.body.token;

            const response = await request(api).patch(`/account`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "update_detail_information",
                    full_name: "user updated"
                })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully updated user details");
        })
    })
});
