const { body } = require("express-validator");

const emailField = body(
	"email",
	"Email should only contain letters and a subaddress."
)
	.trim()
	.normalizeEmail()
	.isEmail()
	.isAlphanumeric("en-US", { ignore: "@._" })
	.custom((value, { req }) => {
		if (value.split("@")[1] === "stratpoint.com") return true;
		return false;
	})
	.withMessage("Provider not supported. Please use another email provider.")
	.custom((value, { req }) => {
		if (value.split("@")[0].length >= 3) return true;
		return false;
	})
	.withMessage("Email should have at least 3 characters address.");

const passwordField = body(
	"password",
	"Password must contain at least 8 characters."
)
	.trim()
	.isLength({ min: 8 });

exports.emailPassword = [emailField, passwordField];

exports.userFields = [
	emailField,

	body(["first_name", "last_name"], "Name fields must only contain letters.")
		.trim()
		.isLength({ min: 3 })
		.withMessage("Name fields must be at least 3 characters long.")
		.isAlpha("en-US", { ignore: " '" }),
];

exports.updateUserPassword = [
	passwordField,

	body("confirmPassword", "Password does not match.")
		.trim()
		.custom((value, { req }) => {
			if (value !== req.body.password) return false;
			return true;
		}),
];
