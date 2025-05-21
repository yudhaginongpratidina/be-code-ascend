import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("ChapterProgressController", () => {

    beforeAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.createMany({
            data: [
                {
                    full_name: "user",
                    username: "user",
                    email: "user@gmail.com",
                    password: bcrypt.hashSync('user@gmail.com', 10),
                    role: "user",
                    point: 10,
                },
                {
                    full_name: "admin",
                    username: "admin",
                    email: "admin@gmail.com",
                    password: bcrypt.hashSync('admin@gmail.com', 10),
                    role: "admin",
                }
            ]
        })
    });

    afterAll(async () => {
        await prismaClient.quizAttempt.deleteMany();
        await prismaClient.chapterProgress.deleteMany();
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let cookie = "";
    let token = "";
    let module_id = "";
    let chapter_id_no_quiz = "";

    describe("01 - create module and chapters", () => {
        it("01.01 - login (admin)", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "admin@gmail.com",
                password: "admin@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            const cookies = login.headers["set-cookie"];

            token = login.body.data.token;
            cookie = cookies;
        });

        it("01.02 - create module", async () => {
            const response = await request(api).post('/modules')
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "module test",
                    description: "module test description",
                    level: "beginner",
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module created successfully");
            expect(response.body.data.id).toBeDefined();

            module_id = response.body.data.id;
        })

        it("01.03 - update module (free and published)", async () => {
            const response = await request(api).patch(`/modules`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "module test",
                    description: "module test description",
                    level: "beginner",
                    is_free: true,
                    is_published: true,
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module updated successfully");
            expect(response.body.data.id).toBeDefined();
        })

        it("01.04 - create chapter (no question)", async () => {
            const response = await request(api).post(`/chapters`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "chapter test",
                    content: "chapter test content",
                    with_question: false,
                    is_published: true
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("chapter created successfully");
            expect(response.body.data.id).toBeDefined();

            chapter_id_no_quiz = response.body.data.id;
        })
    })

    describe("02 - enroll module and attempt chapter (this chapter without question)", () => {
        it("02.01 - login (user)", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            const cookies = login.headers["set-cookie"];

            token = login.body.data.token;
            cookie = cookies;
        });

        it("02.02 - enroll module", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module enrolled successfully");
        });

        it("02.03 - attempt chapter-progress", async () => {
            const response = await request(api).post(`/chapter-progress`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_no_quiz
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("chapter has been completed");
        });

        it("02.04 - attempt chapter-progress, because the chapter has already been completed", async () => {
            const response = await request(api).post(`/chapter-progress`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_no_quiz
                })
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("This chapter has already been marked as completed");
        });

        it("02.05 - find chapter by module is completed", async () => {
            const response = await request(api).post(`/chapter-progress/find-chapters`)
                .set("Cookie", cookie)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("success");
            expect(response.body.data.length).toBe(1);
        });
    })

});
