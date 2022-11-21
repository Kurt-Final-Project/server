const { body, query } = require("express-validator");

exports.createOrUpdateBlog = [
    body("title").trim().isLength({ min: 3 }),

    body("description").trim().isLength({ min: 5 }),
];

exports.createDraft = [body("title").trim(), body("description").trim()];

exports.getBlogs = [
    query(
        "title",
        "Title query must be in form of alphanumeric and must be at least 2 characters long."
    )
        .optional()
        .trim()
        .isAlphanumeric()
        .isLength({ min: 2 }),

    query("page", "Page query must only contain numerics.")
        .optional()
        .trim()
        .isNumeric(),

    query("perPage", "Page query must only contain numerics.")
        .optional()
        .trim()
        .isNumeric(),
];
