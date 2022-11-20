const express = require("express");
const router = express.Router();
const { blogController } = require("../controllers");
const { isAuthenticated } = require("../middlewares");
const { multer } = require("../middlewares");

router
	.route("/")
	.get(blogController.getBlogs)
	.post(isAuthenticated, multer.single("picture"), blogController.createBlog);

router
	.route("/draft")
	.get(isAuthenticated, blogController.getDeletedAndDrafts)
	.post(isAuthenticated, blogController.createDraft);

router
	.route("/:blog_id")
	.get(isAuthenticated, blogController.getBlogDetails)
	.put(isAuthenticated, multer.single("picture"), blogController.updateBlog)
	.delete(isAuthenticated, multer.single("picture"), blogController.deleteBlog);

module.exports = router;
