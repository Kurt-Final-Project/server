const { Blog } = require("../models");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

exports.createBlog = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.errors });
    }

    const { title, description } = req.body;
    try {
        if (!req.file) {
            const error = new Error("Picture is required.");
            error.statusCode = 422;
            throw error;
        }
        const filePath = req.file.path.replaceAll(/\\+/g, "/");

        const blog = await Blog.create({
            title,
            description,
            cover_picture_url: filePath,
            user_id: req.mongoose_id,
        });

        return res.status(201).json({ message: "Blog created.", blog });
    } catch (err) {
        next(err);
    }
};

exports.createDraft = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.errors });
    }

    let title = req.body.title || "draft";
    let description = req.body.description || "draft";

    try {
        const blog = await Blog.create({
            title,
            description,
            user_id: req.mongoose_id,
            is_draft: true,
        });

        return res.status(201).json({ message: "Blog saved to draft.", blog });
    } catch (err) {
        next(err);
    }
};

exports.getBlogDetails = async (req, res, next) => {
    const { blog_id } = req.params;
    try {
        const blog = await Blog.findOne({
            id: blog_id,
            is_draft: false,
            deleted_at: null,
        });
        if (!blog) {
            const error = new Error("Blog cannot be found.");
            error.statusCode = 404;
            throw error;
        }

        return res.status(200).json({ message: "Blog retrieved.", blog });
    } catch (err) {
        next(err);
    }
};

exports.getBlogs = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.errors });
    }

    const page = req.query.page || 1;
    const perPage = req.query.perPage || 10;
    const { title } = req.query;
    try {
        let blogs;
        if (!title) {
            blogs = await Blog.find({
                is_draft: false,
                deleted_at: null,
            })
                .limit(perPage)
                .skip((page - 1) * perPage);
        } else {
            blogs = await Blog.find({
                title: { $regex: title, $options: "i" },
                is_draft: false,
                deleted_at: null,
            })
                .limit(perPage)
                .skip((page - 1) * perPage);
        }

        return res.status(200).json({ message: "Blogs retrieved.", blogs });
    } catch (err) {
        next(err);
    }
};

exports.deleteBlog = async (req, res, next) => {
    const { blog_id } = req.params;
    try {
        const blog = await Blog.findOne({ id: blog_id });
        if (!blog) {
            const error = new Error("Blog cannot be found.");
            error.statusCode = 404;
            throw error;
        }

        if (blog.user_id.toString() !== req.mongoose_id) {
            const error = new Error("Not authorized to delete.");
            error.statusCode = 403;
            throw error;
        }

        await Blog.updateOne(
            { id: blog.id },
            {
                $set: {
                    deleted_at: new Date().toISOString(),
                },
            }
        );

        return res.status(200).json({ message: "Blog deleted!", blog_id });
    } catch (err) {
        next(err);
    }
};

exports.updateBlog = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.errors });
    }

    const { title, description } = req.body;
    const { blog_id } = req.params;
    try {
        const blog = await Blog.findOne({ id: blog_id });
        if (!blog) {
            const error = new Error("Blog cannot be found.");
            error.statusCode = 404;
            throw error;
        }

        if (blog.user_id.toString() !== req.mongoose_id) {
            const error = new Error("Not authorized to update.");
            error.statusCode = 403;
            throw error;
        }

        let filePath = blog.cover_picture_url;
        if (req.file) {
            fs.unlink(path.join(require.main.path, filePath), (err) => {
                if (err && err.code === "ENOENT")
                    console.log("No image to unlink. Proceeding");
                else if (err) console.log("An error occured");
                else console.log("Image updated.");
            });

            filePath = req.file.path.replaceAll(/\\+/g, "/");
        }

        await Blog.updateOne(
            { id: blog.id },
            {
                $set: {
                    title,
                    description,
                    cover_picture_url: filePath,
                },
            }
        );

        return res.status(201).json({ message: "Blog updated!", blog_id });
    } catch (err) {
        next(err);
    }
};

exports.getDeletedAndDrafts = async (req, res, next) => {
    try {
        const blogs = await Blog.find({
            $or: [{ deleted_at: { $ne: null } }, { is_draft: true }],
        });

        const deletedBlogs = blogs.filter((blog) => {
            return blog.deleted_at !== null;
        });

        const draftedBlogs = blogs.filter((blog) => {
            return blog.is_draft === true;
        });

        return res.status(200).json({
            message: "Deleted and drafts retrieved.",
            deletedBlogs,
            draftedBlogs,
        });
    } catch (err) {
        next(err);
    }
};
