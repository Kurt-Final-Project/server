const { body } = require("express-validator");

exports.emailPassword = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Email should only contain letters and subaddress.")
        .isAlphanumeric("en-US", { ignore: "@." })
        .custom((value, { req }) => {
            if (value.split("@")[1] === "stratpoint.com") return true;
            return false;
        })
        .withMessage(
            "Provider not supported. Please use another email provider."
        ),

    body("password", "Password must contain at least 8 characters.")
        .trim()
        .isLength({ min: 8 }),
];

exports.userField = [
    body("email")
        .trim()
        .normalizeEmail()
        .isEmail()
        .isAlphanumeric("en-US", { ignore: "@." })
        .withMessage("Email should only contain letters and a subaddress.")
        .custom((value, { req }) => {
            if (value.split("@")[1] === "stratpoint.com") return true;
            return false;
        })
        .withMessage(
            "Provider not supported. Please use another email provider."
        )
        .custom((value, { req }) => {
            if (value.split("@")[0].length >= 3) return true;
            return false;
        })
        .withMessage("Email should have at least 3 characters address."),

    body("password", "Password must contain at least 8 characters.")
        .trim()
        .isLength({ min: 8 }),

    body(["first_name", "last_name"])
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name fields must be at least 3 characters long.")
        .isAlpha("en-US", { ignore: " '" }),

    body("username", "Username must only contain alphanumeric characters.")
        .trim()
        .isAlphanumeric(),
];

exports.updateUserFields = [
    body("email")
        .optional()
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Email should only contain letters and subaddress.")
        .isAlphanumeric("en-US", { ignore: "@." })
        .custom((value, { req }) => {
            if (value.split("@")[1] === "stratpoint.com") return true;
            return false;
        })
        .withMessage(
            "Provider not supported. Please use another email provider."
        )
        .custom((value, { req }) => {
            if (value.split("@")[0].length >= 3) return true;
            return false;
        })
        .withMessage("Email should have at least 3 characters address."),

    body(["first_name", "last_name"])
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name fields must be at least 3 characters long.")
        .isAlpha("en-US", { ignore: " '" }),

    body("username", "Username must only contain alphanumeric characters.")
        .optional()
        .trim()
        .isAlphanumeric(),
];

exports.updateUserPassword = [
    body("password", "Password must contain at least 8 characters.")
        .trim()
        .isLength({ min: 8 }),

    body("confirmPassword", "Password does not match.")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) return false;
            return true;
        }),
];
