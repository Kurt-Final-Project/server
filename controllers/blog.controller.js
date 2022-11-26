const { Blog } = require("../models");
const { validationResult } = require("express-validator");

exports.createBlog = async function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: errors.errors[0].msg,
            errors: errors?.errors.map((error) => {
                return error.param;
            }),
        });
    }

    const { title, description } = req.body;

    try {
        if (!req.file) {
            const error = new Error("Picture is required.");
            error.statusCode = 422;
            throw error;
        }

        const filePath = req.file.path.replaceAll(/\\/g, "/");
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
        return res.status(422).json({
            message: errors.errors[0].msg,
            errors: errors?.errors.map((error) => {
                return error.param;
            }),
        });
    }

    const title = req.body.title || "draft";
    const description = req.body.description || "draft";

    try {
        const blog = await Blog.create({
            title,
            description,
            cover_picture_url: "public/covers/null.png",
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
            deleted_at: null,
        }).populate({
            path: "user_id",
            select: "-password",
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
        return res.status(422).json({
            message: errors.errors[0].msg,
            errors: errors?.errors.map((error) => {
                return error.param;
            }),
        });
    }

    const page = +req.query.page || 1;
    const perPage = req.query.perPage || 3;
    const title = req.query.title || undefined;

    try {
        const regex = new RegExp(title, "ig");
        const query = {
            is_draft: false,
            deleted_at: null,
            title: { $regex: regex },
        };

        const blogs = await Blog.find(query)
            .populate({
                path: "user_id",
                select: "-password",
            })
            .sort({ updatedAt: -1 })
            .limit(perPage)
            .skip((page - 1) * perPage);

        const totalPosts = await Blog.find(query).countDocuments();
        const lastPage = Math.ceil(totalPosts / perPage);
        const startingPage =
            page > perPage - 1 ? Math.floor(page / perPage) * perPage : 1;
        const endingPage =
            startingPage + 2 <= lastPage ? startingPage + 2 : lastPage;

        return res.status(200).json({
            message: "Blogs retrieved.",
            blogs,
            totalPosts,
            currentPage: page,
            perPage,
            hasPreviousPage: page > 1,
            hasNextPage: page < lastPage,
            startingPage:
                page > perPage - 1 ? Math.floor(page / perPage) * perPage : 1,
            endingPage,
        });
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
        return res.status(422).json({
            message: errors.errors[0].msg,
            errors: errors?.errors.map((error) => {
                return error.param;
            }),
        });
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
        if (req.file) filePath = req.file.path.replaceAll(/\\/g, "/");

        await Blog.updateOne(
            { id: blog.id },
            {
                $set: {
                    title,
                    description,
                    cover_picture_url: filePath,
                    is_draft: false,
                },
            }
        );

        return res.status(201).json({ message: "Blog updated!", blog_id });
    } catch (err) {
        next(err);
    }
};

exports.getUserPosts = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ user_id: req.mongoose_id })
            .populate({
                path: "user_id",
                select: "-password",
            })
            .sort({ updatedAt: -1 });

        const postedBlogs = blogs.filter((blog) => {
            return blog.deleted_at === null && blog.is_draft === false;
        });

        const deletedBlogs = blogs.filter((blog) => {
            return blog.deleted_at !== null;
        });

        const draftedBlogs = blogs.filter((blog) => {
            return blog.is_draft === true && blog.deleted_at === null;
        });

        return res.status(200).json({
            message: "Deleted and drafts retrieved.",
            postedBlogs,
            deletedBlogs,
            draftedBlogs,
        });
    } catch (err) {
        next(err);
    }
};
