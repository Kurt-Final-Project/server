const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const blogModel = new mongoose.Schema(
	{
		id: {
			type: String,
			default: uuidv4,
			required: true,
		},
		title: {
			type: String,
			default: "draft",
			required: true,
		},
		description: {
			type: String,
			default: "draft",
			required: true,
		},
		cover_picture_url: {
			type: String,
		},
		deleted_at: {
			type: String,
			default: null,
		},
		is_draft: {
			type: Boolean,
			default: false,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Blog = mongoose.model("Blog", blogModel);
module.exports = Blog;
