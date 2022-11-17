const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const blogModel = new mongoose.Schema(
	{
		id: {
			type: String,
			default: uuidv4(),
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		cover_picture_url: {
			type: String,
			required: true,
		},
		deleted_at: String,
		is_draft: {
			type: Boolean,
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
