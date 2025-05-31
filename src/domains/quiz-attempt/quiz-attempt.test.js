import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("QuizAttemptController", () => {

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

    let token = "";
    let module_id = "";
    let chapter_id_no_quiz = "";
    let chapter_id_with_quiz = "";

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

            token = login.body.data.token;
        });

        it("01.02 - create module", async () => {
            const response = await request(api).post('/modules')
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

        it("01.05 - create chapter (with question)", async () => {
            const response = await request(api).post(`/chapters`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "chapter other with question",
                    content: "chapter test content with question",
                    with_question: true,
                    question: "question test",
                    answer_1: "answer 1",
                    answer_2: "answer 2",
                    answer_3: "answer 3",
                    correct_answer: "answer 1",
                    is_published: true
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("chapter created successfully");
            expect(response.body.data.id).toBeDefined();

            chapter_id_with_quiz = response.body.data.id;
        })
    })

    describe("02 - enroll module and attempt chapter (this chapter without question and chapter with question)", () => {
        it("02.01 - login (user)", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            token = login.body.data.token;
        });

        it("02.02 - enroll module", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module enrolled successfully");
        });

        it("02.03 - attempt chapter-progress", async () => {
            const response = await request(api).post(`/chapter-progress`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_no_quiz
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("chapter has been completed");
        });

        it("02.03 - attempt chapter-progress failed, because the quiz hasn't been answered yet", async () => {
            const response = await request(api).post(`/chapter-progress`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_with_quiz
                })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("You haven't finished the quiz yet");
        });

        it("02.04.01 - attempt quiz failed, because wrong answer", async () => {
            const response = await request(api).post(`/quiz-attempt`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_with_quiz,
                    answer: "answer 12"
                })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("wrong answer");
        });

        it("02.04.02 - attempt quiz successfully", async () => {
            const response = await request(api).post(`/quiz-attempt`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_with_quiz,
                    answer: "answer 1"
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("That's the right answer—good work!");
        });

        it("02.04.03 - attempt quiz failed, because you have already done this quiz", async () => {
            const response = await request(api).post(`/quiz-attempt`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    chapter_id: chapter_id_with_quiz,
                    answer: "answer 1"
                })
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("you have already done this quiz");
        });

        it("02.05 - find attempt quiz", async () => {
            const response = await request(api).post(`/quiz-attempt/find`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    chapter_id: chapter_id_with_quiz
                })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("success");
            expect(response.body.data).toBeDefined();
        });
    })
});
