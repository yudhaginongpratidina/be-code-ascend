import request from "supertest";
import prismaClient from "../../application/database.js";
import bcrypt from "bcrypt";
import 'dotenv/config';

const api = `${process.env.EXPRESS_TEST}`;

describe("LeaderboardController", () => {
    beforeAll(async () => {
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.user.createMany({
            data: [
                {
                    full_name: "user one",
                    username: "user_one",
                    email: "user@one.com",
                    password: bcrypt.hashSync('user@one.com', 10),
                    role: "user",
                    experience: 10000
                },
                {
                    full_name: "user two",
                    username: "user_two",
                    email: "user@two.com",
                    password: bcrypt.hashSync('user@two.com', 10),
                    role: "user",
                    experience: 20000
                },
                {
                    full_name: "user three",
                    username: "user_three",
                    email: "user@three.com",
                    password: bcrypt.hashSync('user@three.com', 10),
                    role: "user",
                    experience: 30000
                },
            ]
        })
    });

    afterAll(async () => {
        await prismaClient.enrollment.deleteMany();
        await prismaClient.chapter.deleteMany();
        await prismaClient.module.deleteMany();
        await prismaClient.user.deleteMany();
        await prismaClient.$disconnect();
    });

    let token = "";


    describe("test get leaderboards", () => {

        it("login", async () => {
            const login = await request(api).post('/auth/login').send({
                type: "login_with_email",
                email: "user@one.com",
                password: "user@one.com"
            });
            expect(login.status).toBe(200);
            expect(login.body.message).toBe("user logged in successfully");
            expect(login.body.token).toBeDefined();

            token = login.body.token;
        });

        it("should return leaderboard", async () => {
            const response = await request(api).post("/leaderboard")
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "search_all" });
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(3);
        });

        it("should return leaderboard by me", async () => {
            const response = await request(api).post("/leaderboard")
                .set("Authorization", `Bearer ${token}`)
                .send({ type: "search_by_me" });
            expect(response.status).toBe(200);
        });

    });
});
