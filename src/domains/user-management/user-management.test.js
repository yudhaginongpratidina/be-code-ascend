import prismaClient from "../../application/database.js";
import request from "supertest";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("UserManagementController", () => {

    beforeAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.user.deleteMany();
        const roles = ['user', 'contributor', 'admin', 'superadmin'];
        const users = Array.from({ length: 40 }, (_, i) => ({
            full_name: `User ${i + 1}`,
            username: `user${i + 1}`,
            email: `user${i + 1}@test.com`,
            password: bcrypt.hashSync('user${i + 1}@test.com', 10),
            role: roles[i % roles.length]
        }));
        await prismaClient.user.createMany({
            data: users
        });
        await prismaClient.user.createMany({
            data: [
                {
                    full_name: "user user",
                    username: "user_user",
                    email: "user@user.com",
                    password: bcrypt.hashSync('user@user.com', 10),
                    role: "user"
                },
                {
                    full_name: "user contributor",
                    username: "user_contributor",
                    email: "user@contributor.com",
                    password: bcrypt.hashSync('user@contributor.com', 10),
                    role: "contributor"
                },
                {
                    full_name: "user admin",
                    username: "user_admin",
                    email: "user@admin.com",
                    password: bcrypt.hashSync('user@admin.com', 10),
                    role: "admin"
                },
                {
                    full_name: "user superadmin",
                    username: "user_superadmin",
                    email: "user@superadmin.com",
                    password: bcrypt.hashSync('user@superadmin.com', 10),
                    role: "superadmin"
                },
            ]
        })
    });

    afterAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let token = "";
    let search_user_by_id = "";
    let search_user_by_username = "";

    describe("test login", () => {
        it("should return a 200 status code if user login with email", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "user@user.com"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("user logged in successfully");
            expect(response.body.data.token).toBeDefined();

            token = response.body.data.token;
        })
    });

    describe("test get all users", () => {
        it("should return a 200 status code when get all users successfully", async () => {
            const response = await request(api).get('/users');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("successfully obtained all user data");
            expect(response.body.data.total_user).toBeDefined();
            expect(response.body.data.total_by_role).toBeDefined();
            expect(response.body.data.total_by_role.user).toBeDefined();
            expect(response.body.data.total_by_role.contributor).toBeDefined();
            expect(response.body.data.total_by_role.admin).toBeDefined();
            expect(response.body.data.total_by_role.superadmin).toBeDefined();
            expect(response.body.data.users_by_role).toBeDefined();
            expect(response.body.data.users_by_role.user).toBeDefined();
            expect(response.body.data.users_by_role.contributor).toBeDefined();
            expect(response.body.data.users_by_role.admin).toBeDefined();
            expect(response.body.data.users_by_role.superadmin).toBeDefined();

            search_user_by_id = response.body.data.users_by_role.user[0].id;
            search_user_by_username = response.body.data.users_by_role.user[0].username;
        })
    })

    describe("test search users", () => {
        it("should return a 400 status code when search but type is not defined", async () => {
            const response = await request(api).post(`/users/search`).send({});
            expect(response.status).toBe(400);
            expect(response.body.data[0].message).toBe("Type must be search_by_id or search_by_username");
        })

        it("should return a 404 status code when search user not found (search by id)", async () => {
            const response = await request(api).post(`/users/search`).send({
                type: "search_by_id",
                id: search_user_by_id + 1
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("user not found");
        })

        it("should return a 404 status code when search user not found (search by username)", async () => {
            const response = await request(api).post(`/users/search`).send({
                type: "search_by_username",
                username: "wrong_username"
            });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe("user not found");
        })

        it("should return a 200 status code when search user not found (search by id)", async () => {
            const response = await request(api).post(`/users/search`).send({
                type: "search_by_id",
                id: search_user_by_id
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully obtained user data");
        })

        it("should return a 200 status code when search user not found (search by username)", async () => {
            const response = await request(api).post(`/users/search`).send({
                type: "search_by_username",
                username: search_user_by_username
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully obtained user data");
        })
    })

    describe("test failed update user role but not superadmin", () => {
        it("should return a 400 status code when update user but type is not defined", async () => {
            const response = await request(api).patch(`/users`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(403);
        })

        it("should return a 200 status code when update user successfully", async () => {
            const response = await request(api).patch(`/users`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: "update_role",
                    id: search_user_by_id,
                    role: "superadmin"
                });
            expect(response.status).toBe(403);
        })
    })

    describe("test update user role (superadmin only)", () => {
        it("should return a 200 status code if user login with email (login as superadmin)", async () => {
            const response = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("user logged in successfully");
            expect(response.body.data.token).toBeDefined();

            token = response.body.data.token;
        })

        it("should return a 400 status code when update user but type is not defined", async () => {
            const response = await request(api).patch(`/users`)
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body.data[0].message).toBe("Type must be update_role");
        })

        it("should return a 200 status code when update user successfully", async () => {
            const response = await request(api).patch(`/users`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type: "update_role",
                    id: search_user_by_id,
                    role: "superadmin"
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully updated user role");
        })
    })

});
