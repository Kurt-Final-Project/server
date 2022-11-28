const { Blog } = require("../models");
const { errorChecker } = require("../helpers");

exports.createBlog = async function (req, res, next) {
    const { title, description } = req.body;

    try {
        errorChecker.hasFile(req.file);

        const filePath = req.file.path.split("\\").join("/");
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

        errorChecker.isExisting(blog, "Blog cannot be found.", 404);

        return res.status(200).json({ message: "Blog retrieved.", blog });
    } catch (err) {
        next(err);
    }
};

exports.getBlogs = async (req, res, next) => {
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

        errorChecker.isExisting(blog, "Blog cannot be found.", 404);
        errorChecker.isAuthorized(
            blog.user_id,
            req.mongoose_id,
            "Not authorized to delete."
        );

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
    const { title, description } = req.body;
    const { blog_id } = req.params;

    try {
        const blog = await Blog.findOne({ id: blog_id });

        errorChecker.isExisting(blog, "Blog cannot be found.", 404);
        errorChecker.isAuthorized(
            blog.user_id,
            req.mongoose_id,
            "Not authorized to update."
        );

        let filePath = blog.cover_picture_url;
        if (req.file) filePath = req.file.path.split("\\").join("/");

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
