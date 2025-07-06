import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("EnrollmentManagementController", () => {

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
                    full_name: "user 1",
                    username: "user1",
                    email: "user1@gmail.com",
                    password: bcrypt.hashSync('user1@gmail.com', 10),
                    role: "user",
                    point: 0,
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
    let module_id_2 = "";

    describe("01 - test create new module and chapter - free access (access only contributor, admin and superadmin", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "admin@gmail.com",
                password: "admin@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 201 status code when create new module successfully", async () => {
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
            expect(response.body.data.title).toBe("module test");
            expect(response.body.data.description).toBe("module test description");
            expect(response.body.data.level).toBe("beginner");
            expect(response.body.data.created_at).toBeDefined();

            module_id = response.body.data.id;
        })

        it("scenario 03 - should return a 200 status code whne update module successfully (free and published)", async () => {
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
    });

    describe("02 - test enroll module (module is free and published)", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 200 status code when search all module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_all",
                })
            expect(response.status).toBe(200);
            expect(response.body.data[0].author.id).toBeDefined();

            module_id = response.body.data[0].id;
        });

        it("scenario 03 - should return a 200 status code when search by id module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_by_id",
                    value: module_id,
                })
            expect(response.status).toBe(200);
        });

        it("scenario 04 - should return a 201 status code when enroll module successfully", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module enrolled successfully");
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.user_id).toBeDefined();
            expect(response.body.data.user_id.id).toBeDefined();
            expect(response.body.data.user_id.name).toBeDefined();
            expect(response.body.data.module_id).toBeDefined();
            expect(response.body.data.module_id.id).toBeDefined();
            expect(response.body.data.module_id.title).toBeDefined();
            expect(response.body.data.created_at).toBeDefined();
        });

        it("scenario 05 - should return a 409 status code when user already enrolled module", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                })
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("You have already enrolled in this module");
        });

    })

    describe("03 - test create new module and chapter - no free access (access only contributor, admin and superadmin", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "admin@gmail.com",
                password: "admin@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 201 status code when create new module successfully", async () => {
            const response = await request(api).post('/modules')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "module test 2",
                    description: "module test description",
                    level: "beginner",
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module created successfully");
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.title).toBe("module test 2");
            expect(response.body.data.description).toBe("module test description");
            expect(response.body.data.level).toBe("beginner");
            expect(response.body.data.created_at).toBeDefined();

            module_id_2 = response.body.data.id;
        })

        it("scenario 03 - should return a 200 status code whne update module successfully (free and published)", async () => {
            const response = await request(api).patch(`/modules`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id_2,
                    title: "module test 2",
                    description: "module test description",
                    level: "beginner",
                    is_free: false,
                    is_published: true,
                });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module updated successfully");
            expect(response.body.data.id).toBeDefined();
        })

        it("should return a 201 status code when create new chapter (no question) successfully", async () => {
            const response = await request(api).post(`/chapters`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id_2,
                    title: "chapter test",
                    content: "chapter test content",
                    with_question: false,
                    is_published: true
                });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("chapter created successfully");
            expect(response.body.data.id).toBeDefined();
        });

    });

    describe("04 - test enroll module - point fulfilled (module is not free and published)", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 201 status code when enroll module successfully", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id_2,
                })
            expect(response.status).toBe(201);
            expect(response.body.message).toBe("module enrolled successfully");
            expect(response.body.data.id).toBeDefined();
        });
    });

    describe("05 - test enroll module - point not fulfilled (module is not free and published)", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user1@gmail.com",
                password: "user1@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 400 status code when enroll module failed but point not fulfilled", async () => {
            const response = await request(api).post(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id_2,
                })
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("You don't have enough points");
        });
    });

    describe("06 - test get list module enrolled", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 200 status code when get list module enrolled successfully", async () => {
            const response = await request(api).get(`/enrollments`)
                .set("Authorization", `Bearer ${token}`)
            expect(response.status).toBe(200);
            expect(response.body.data[0].id).toBeDefined();
        });
    });

    describe("07 - test get detail module", () => {
        it("scenario 01 - should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@gmail.com",
                password: "user@gmail.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("scenario 02 - should return a 200 status code when get detail module successfully", async () => {
            const response = await request(api).get('/enrollments/' + module_id_2)
                .set("Authorization", `Bearer ${token}`)
            expect(response.status).toBe(200);
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.module.title).toBeDefined();
            expect(response.body.data.module.description).toBeDefined();
            expect(response.body.data.module.level).toBeDefined();

            expect(response.body.data.module.author).toBeDefined();
            expect(response.body.data.module.author.id).toBeDefined();
            expect(response.body.data.module.author.name).toBeDefined();

            expect(response.body.data.module.chapters).toBeDefined();
            expect(response.body.data.module.chapters[0].id).toBeDefined();
            expect(response.body.data.module.chapters[0].title).toBeDefined();
            expect(response.body.data.module.chapters[0].with_question).toBeDefined();
            expect(response.body.data.module.chapters[0].rewards).toBeDefined();
            if (response.body.data.module.chapters[0].with_question) {
                expect(response.body.data.module.chapters[0].rewards.point_earned).toBeDefined();
                expect(response.body.data.module.chapters[0].rewards.exp_earned).toBeDefined();
            } else {
                expect(response.body.data.module.chapters[0].rewards.exp_earned).toBeDefined();
            }
        });
    });

});
