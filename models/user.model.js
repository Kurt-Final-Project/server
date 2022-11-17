const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userModel = new mongoose.Schema({
	id: {
		type: String,
		default: uuidv4(),
		required: true,
	},
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	first_name: {
		type: String,
		required: true,
	},
	last_name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	profile_picture_url: {
		type: String,
		required: true,
	},
	deleted_at: {
		type: String,
		required: true,
	},
});

const User = mongoose.model("User", userModel);
module.exports = User;
