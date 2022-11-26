const { faker } = require("@faker-js/faker");
const mongoose = require("mongoose");
const { User, Blog } = require("./models");
const path = require("path");
const md5 = require("md5");

require("dotenv").config();

const produceFakeBlogs = async () => {
    await mongoose.connect(process.env.MONGODB_URI + process.env.DB_TABLE, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    await User.deleteMany();
    await Blog.deleteMany();

    const maxUsers = 5;
    const blogsPerUser = 3;
    for (let i = 0; i < maxUsers; i++) {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const img = Math.floor(Math.random() * 5) + ".png";

        const testUser = await User.create({
            username: faker.internet
                .userName(faker.internet.firstName, faker.internet.lastName)
                .toLocaleLowerCase(),
            first_name,
            last_name,
            email: faker.internet.email(
                first_name.toLowerCase(),
                last_name.toLowerCase(),
                "stratpoint.com"
            ),
            password: md5("123123123"),
            profile_picture_url: path
                .join("public", "covers", img)
                .split("\\")
                .join("/"),
        });

        const user = await User.create({
            username: faker.internet
                .userName(faker.internet.firstName, faker.internet.lastName)
                .toLocaleLowerCase(),
            first_name,
            last_name,
            email: faker.internet.email(
                first_name.toLowerCase(),
                last_name.toLowerCase(),
                "stratpoint.com"
            ),
            password: md5("123123123"),
            profile_picture_url: path
                .join("public", "covers", img)
                .split("\\")
                .join("/"),
        });

        for (let i = 0; i < blogsPerUser; i++) {
            const img = Math.floor(Math.random() * 5) + ".png";
            await Blog.create({
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                cover_picture_url: path
                    .join("public", "covers", img)
                    .split("\\")
                    .join("/"),
                user_id: user._id,
            });
        }
    }

    return process.exit();
};

produceFakeBlogs();
