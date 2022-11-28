const { User } = require("../models");
const { jwtSign } = require("../utils");
const md5 = require("md5");
const { errorChecker } = require("../helpers");

exports.postLoginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        errorChecker.isPasswordCorrect(
            user?.password,
            password,
            "No user found.",
            404
        );

        const token = jwtSign({
            mongoose_id: user._id,
            user_id: user.id,
            username: user.username,
            email: user.email,
        });

        return res.status(200).json({ message: "Login success!", token });
    } catch (err) {
        next(err);
    }
};

exports.postSignupUser = async (req, res, next) => {
    const { username, password, first_name, last_name, email } = req.body;

    try {
        const isUserExisting = await User.findOne({
            $or: [{ email }, { username }],
        });

        errorChecker.isExisting(
            !isUserExisting,
            "User with that email/username already exist.",
            403
        );
        errorChecker.hasFile(req.file);

        const filePath = req.file.path.split("\\").join("/");

        await User.create({
            username,
            password: md5(password),
            first_name,
            last_name,
            email,
            profile_picture_url: filePath,
        });

        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        next(err);
    }
};

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ _id: req.mongoose_id }).select(
            "-password"
        );

        errorChecker.isExisting(user, "No user found.", 404);

        return res
            .status(200)
            .json({ message: "User retrieved successfully.", user });
    } catch (err) {
        next(err);
    }
};

exports.updateUserDetails = async (req, res, next) => {
    let { username, email, first_name, last_name } = req.body;

    try {
        const user = await User.findOne({ _id: req.mongoose_id });

        errorChecker.isExisting(user, "No user to update found.", 404);

        const isExisting = await User.findOne({
            $or: [{ email }, { username }],
            _id: {
                $ne: req.mongoose_id,
            },
        });

        errorChecker.isExisting(
            !isExisting,
            "User with that email/username already exist.",
            403
        );

        await User.updateOne(
            { _id: req.mongoose_id },
            {
                $set: {
                    username,
                    email,
                    first_name,
                    last_name,
                },
            }
        );

        return res.status(200).json({
            message: "User details updated.",
            user_id: req.mongoose_id,
        });
    } catch (err) {
        next(err);
    }
};

exports.updateUserPicture = async (req, res, next) => {
    try {
        errorChecker.hasFile(req.file);

        const filePath = req.file.path.split("\\").join("/");

        await User.updateOne(
            { _id: req.mongoose_id },
            {
                $set: { profile_picture_url: filePath },
            }
        );
        return res.status(201).json({
            message: "User profile picture updated.",
            user_id: req.mongoose_id,
        });
    } catch (err) {
        next(err);
    }
};

exports.changeUserPassword = async (req, res, next) => {
    const { password, oldPassword } = req.body;

    try {
        const user = await User.findOne({ _id: req.mongoose_id });

        errorChecker.isExisting(user, "No user found.", 404);
        errorChecker.isPasswordCorrect(
            user.password,
            oldPassword,
            "Password does not match with the previous one.",
            403
        );
        errorChecker.isPasswordSameAsPrevious(user.password, password);
        errorChecker.hasUsedAllChances(user.password_chances);

        await User.updateOne(
            { _id: req.mongoose_id },
            {
                $set: {
                    password: md5(password),
                    password_chances: user.password_chances + 1,
                },
            }
        );
        return res.status(200).json({
            message: "User password changed.",
            user_id: req.mongoose_id,
        });
    } catch (err) {
        next(err);
    }
};
