module.exports = (app) => {
    app.use("/api/user", require("./user.router"));
    app.use("/api/blog", require("./blog.router"));
};
