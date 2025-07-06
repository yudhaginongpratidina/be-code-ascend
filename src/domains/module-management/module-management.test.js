import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("ModuleManagementController", () => {

    beforeAll(async () => {
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.createMany({
            data: [
                {
                    full_name: "user superadmin",
                    username: "superadmin",
                    email: "user@superadmin.com",
                    password: bcrypt.hashSync('user@superadmin.com', 10),
                    role: "superadmin",
                },
                {
                    full_name: "user superadmin 2",
                    username: "superadmin_2",
                    email: "user2@superadmin.com",
                    password: bcrypt.hashSync('user2@superadmin.com', 10),
                    role: "superadmin",
                },
                {
                    full_name: "user",
                    username: "user",
                    email: "user@user.com",
                    password: bcrypt.hashSync('user@user.com', 10),
                    role: "user",
                },
            ]
        });
    });

    afterAll(async () => {
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let token = "";

    let module_id = "";
    let module_title = "";
    let module_level = "";
    let module_cretaor_id = "";

    let module_delete_id = "";

    describe("test create new module (access only contributor, admin and superadmin", () => {

        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            token = login.body.data.token;
        });

        it("should return a 201 status code when create new module successfully", async () => {
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
        });

        it("should return a 409 status code when create new module failed because user already created the module", async () => {
            const response = await request(api).post('/modules')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "module test",
                    description: "module test description",
                    level: "beginner",
                });
            expect(response.status).toBe(409);
            expect(response.body.message).toBe("you have already created this module");
        });

        Array.from({ length: 10 }).forEach((_, i) => {
            it(`(${i + 1}) should return a 201 status code when create new other module successfully`, async () => {
                const response = await request(api).post('/modules')
                    .set("Authorization", `Bearer ${token}`)
                    .send({
                        title: `module test ${i + 1}`,
                        description: `module test ${i + 1} description`,
                        level: "intermediate",
                    });
                expect(response.status).toBe(201);
            });
        });

    });

    describe("test create module but user role not contributor, admin or superadmin", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@user.com",
                password: "user@user.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();


            token = login.body.data.token;
        });

        it("should return a 403 status code when create new module successfully but user role not access", async () => {
            const response = await request(api).post('/modules')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "module test 1",
                    description: "module test 1 description",
                    level: "beginner",
                });
            expect(response.status).toBe(403);
        });
    });

    describe("test update module (only creator this module", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            token = login.body.data.token;
        });

        it("should return a 200 status code when update module successfully", async () => {
            const response = await request(api).patch(`/modules`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id, // Ensure this ID exists
                    title: "module test update",
                    description: "module test update description",
                    level: "intermediate",
                    is_free: true,
                    is_published: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module updated successfully");
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.title).toBe("module test update");
            expect(response.body.data.description).toBe("module test update description");
            expect(response.body.data.level).toBe("intermediate");
            expect(response.body.data.is_free).toBe(true);
            expect(response.body.data.is_published).toBe(true);
            expect(response.body.data.creator_id).toBeDefined();
            expect(response.body.data.updated_at).toBeDefined();
        })
    });

    describe("test update module but user not creator this module", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user2@superadmin.com",
                password: "user2@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            token = login.body.data.token;
        });

        it("should return a 403 status code when update module successfully", async () => {
            const response = await request(api).patch(`/modules`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    module_id: module_id,
                    title: "module test update",
                    description: "module test update description",
                    level: "intermediate",
                    is_free: true,
                    is_published: true,
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toBe("You are not the creator of this module");
        })
    });

    describe("test search module", () => {
        it("should return a 200 status code when search all module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_all",
                })
            expect(response.status).toBe(200);
            expect(response.body.data[0].author.id).toBeDefined();


            module_id = response.body.data[0].id;
            module_title = response.body.data[0].title;
            module_level = response.body.data[0].level;
            module_cretaor_id = response.body.data[0].author.id;
        });

        it("should return a 200 status code when search by title module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_by_title",
                    value: module_title,
                })
            expect(response.status).toBe(200);
        });

        it("should return a 200 status code when search by level module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_by_level",
                    value: module_level,
                })
            expect(response.status).toBe(200);
        });

        it("should return a 200 status code when search by author id module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_by_creator_id",
                    value: module_cretaor_id,
                })
            expect(response.status).toBe(200);
        });

        it("should return a 200 status code when search by id module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .send({
                    type: "search_by_id",
                    value: module_id,
                })
            expect(response.status).toBe(200);
        });

        it("should return a 200 status code when search by me module successfully", async () => {
            const response = await request(api).post('/modules/search')
                .set("Authorization", `Bearer ${token}`)
                .send({
                    type: "search_by_me"
                })
            expect(response.status).toBe(200);
        });
    })

    describe("test delete module (only creator this module and has role contributor, admin or superadmin)", () => {
        it("should return a 200 status code when login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@superadmin.com",
                password: "user@superadmin.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.data.token).toBeDefined();

            token = login.body.data.token;
        });

        it("should return a 200 status code when delete module successfully", async () => {
            const response = await request(api).delete(`/modules/${module_id}`)
                .set("Authorization", `Bearer ${token}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module deleted successfully");
            expect(response.body.data.id).toBeDefined();

            module_delete_id = response.body.data.id;
        })
    });

    describe("test restore module (only creator this module and has role contributor, admin or superadmin)", () => {

        it("should return a 200 status code when delete module successfully", async () => {
            const response = await request(api).patch(`/modules/${module_id}`)
                .set("Authorization", `Bearer ${token}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toBe("module restored successfully");
            expect(response.body.data.id).toBe(module_delete_id);

        })
    });

});
