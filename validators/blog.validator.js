const { body, query } = require("express-validator");

exports.createOrUpdateBlog = [
    body("title")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Title must be at least 3 characters long."),

    body("description")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Title must be at least 5 characters long."),
];

exports.createDraft = [body("title").trim(), body("description").trim()];

exports.getBlogs = [
    query("page", "Page query must only contain numerics.")
        .optional()
        .trim()
        .isNumeric(),

    query("perPage", "Page query must only contain numerics.")
        .optional()
        .trim()
        .isNumeric(),
];
