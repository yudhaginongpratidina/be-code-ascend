import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("ChapterManagementController", () => {

    beforeAll(async () => {
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.create({
            data: {
                full_name: "user superadmin",
                username: "superadmin",
                email: "user@superadmin.com",
                password: bcrypt.hashSync('user@superadmin.com', 10),
                role: "superadmin",
            }
        });
    });

    afterAll(async () => {
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let token = "";
    let module_id = "";
    let chapter_id = "";

    describe("test create new chapter (access only contributor, admin and superadmin", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("should return a 201 status code when create new module successfully", async () => {
            const response = await request(api).post('/modules')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "module test 1",
                    description: "module test 1 description",
                    level: "beginner",
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module created successfully");
            expect(response.body.data.id).toBeDefined();
            module_id = response.body.data.id;
        });

        it("should return a 201 status code when create new chapter (no question) successfully", async () => {
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

            chapter_id = response.body.data.id;
        });

        it("should return a 409 status code when create new chapter (no question) but chpater already exist", async () => {
            const response = await request(api).post(`/chapters`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "chapter test",
                    content: "chapter test content",
                    with_question: false,
                    is_published: true
                });
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("chapter already exists");
        });

        it("should return a 201 status code when create new chapter (with question) successfully", async () => {
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
        });

        it("should return status code 400 when creating a new chapter (with questions) but there are duplicate answers", async () => {
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
                    answer_3: "answer 2",
                    correct_answer: "answer 1",
                    is_published: true
                });
            expect(response.status).toBe(400);
            expect(response.body.data[0].path).toBe("answer_1");
            expect(response.body.data[0].message).toBe("Answers must be unique");

            expect(response.body.data[1].path).toBe("answer_2");
            expect(response.body.data[1].message).toBe("Answers must be unique");

            expect(response.body.data[2].path).toBe("answer_3");
            expect(response.body.data[2].message).toBe("Answers must be unique");
        });

        it("should return status code 400 when creating a new chapter (with questions) but the correct answer does not match the answer in the options", async () => {
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
                    correct_answer: "answer 4",
                    is_published: true
                });
            expect(response.status).toBe(400);
            expect(response.body.data[0].path).toBe("correct_answer");
            expect(response.body.data[0].message).toBe("Correct answer must be one of the provided answers");
        });

    })

    describe("test update cahpter (access only contributor, admin and superadmin) and he is the author this chapter", () => {
        it("should return a 200 status code when update chapter successfully", async () => {
            const response = await request(api).patch(`/chapters`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    id: chapter_id,
                    module_id: module_id,
                    title: "chapter test update",
                    content: "chapter test content update",
                    with_question: false,
                    is_published: true
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("chapter updated successfully");
            expect(response.body.data.id).toBeDefined();
        });
    });

    describe("test search chapters", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("should return a 200 status code when search chapters by module_id", async () => {
            const response = await request(api).post('/chapters/search').send({
                type: "search_by_module_id",
                value: module_id
            })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully obtained chapter data");
        });

        it("should return a 200 status code when search chapters by id", async () => {
            const response = await request(api).post('/chapters/search')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "search_by_id_only_by_creator_id",
                    value: chapter_id
                })
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("Successfully obtained chapter data");
        });
    });

    describe("test delete chapter (access only contributor, admin and superadmin) and he is the author this chapter", () => {
        it("should return a 200 status code when delete chapter successfully", async () => {
            const response = await request(api).delete(`/chapters/${chapter_id}`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("chapter deleted successfully");
        });
    });

    describe("test update level module (access only contributor, admin and superadmin) and he is the author this module", () => {
        it("should return a 200 status code when update module successfully", async () => {
            const response = await request(api).patch(`/modules`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "module test update",
                    description: "module test update description",
                    level: "advanced",
                    is_free: true,
                    is_published: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module updated successfully");
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.title).toBe("module test update");
            expect(response.body.data.description).toBe("module test update description");
            expect(response.body.data.level).toBe("advanced");
        })
    })

    describe("test restore chapter (access only contributor, admin and superadmin) and he is the author this chapter", () => {
        it("should return a 200 status code when restore chapter successfully", async () => {
            const response = await request(api).patch(`/chapters/${chapter_id}`)
                .set("Authorization", `Bearer ${token}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("chapter restored successfully");
        });
    });
});
