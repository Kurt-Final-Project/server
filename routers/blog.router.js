const express = require("express");
const router = express.Router();
const { blogController } = require("../controllers");
const { isAuthenticated } = require("../middlewares");
const { multer, validFields } = require("../middlewares");
const blogValidator = require("../validators/blog.validator");

router
    .route("/")
    .get(isAuthenticated, blogController.getBlogs)
    .post(
        isAuthenticated,
        multer.single("picture"),
        blogValidator.createOrUpdateBlog,
        validFields,
        blogController.createBlog
    );

router
    .route("/all")
    .get(isAuthenticated, blogController.getUserPosts)
    .post(
        isAuthenticated,
        blogValidator.createDraft,
        validFields,
        blogController.createDraft
    );

router
    .route("/:blog_id")
    .get(isAuthenticated, blogController.getBlogDetails)
    .put(
        isAuthenticated,
        multer.single("picture"),
        blogValidator.createOrUpdateBlog,
        validFields,
        blogController.updateBlog
    )
    .delete(isAuthenticated, blogController.deleteBlog);

module.exports = router;
