const { body, query } = require("express-validator");

exports.createOrUpdateBlog = [
    body("title")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long."),

    body("description")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Description must be at least 5 characters long."),
];
