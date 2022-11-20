const { User } = require("../models");
const { jwtSign } = require("../utils");
const md5 = require("md5");

exports.postLoginUser = async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (user?.password !== md5(password)) {
			const error = new Error("No user found.");
			error.statusCode = 404;
			throw error;
		}
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
		const existing = await User.findOne({ $or: [{ email }, { username }] });
		if (existing) {
			const error = new Error("User with that email/username already exist.");
			error.statusCode = 403;
			throw error;
		}

		if (!req.file) {
			const error = new Error("Picture is required.");
			error.statusCode = 422;
			throw error;
		}
		const filePath = req.file.path.replaceAll(/\\+/g, "/");
		console.log(filePath);

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
	const { user_id } = req;
	try {
		const user = await User.findOne({ id: user_id }).select("-password");
		if (!user) {
			const error = new Error("No user found.");
			error.statusCode = 404;
			throw error;
		}

		return res
			.status(200)
			.json({ message: "User retrieved successfully.", user });
	} catch (err) {
		next(err);
	}
};

exports.updateUserDetails = async (req, res, next) => {
	const { username, email, first_name, last_name } = req.body;
	try {
		const user = await User.findOne({ _id: req.mongoose_id });
		if (!user) {
			const error = new Error("No user to update found.");
			error.statusCode = 404;
			throw error;
		}

		let sameUser = user.username === username || user.email === email;
		const existing = await User.findOne({ $or: [{ email }, { username }] });
		if (existing && !sameUser) {
			const error = new Error("User with that email/username already exist.");
			error.statusCode = 403;
			throw error;
		}

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

		return res
			.status(200)
			.json({ message: "User details updated.", user_id: req.mongoose_id });
	} catch (err) {
		next(err);
	}
};

exports.updateUserPicture = async (req, res, next) => {
	try {
		if (!req.file) {
			const error = new Error("Picture is required.");
			error.statusCode = 422;
			throw error;
		}
		const filePath = req.file.path.replaceAll(/\\+/g, "/");
		await User.updateOne(
			{ _id: req.mongoose_id },
			{
				$set: { profile_picture_url: filePath },
			}
		);
	} catch (err) {
		next(err);
	}
};

exports.forgetUserPassword = async (req, res, next) => {
	const { password } = req.body;
	try {
		const user = await User.findOne({ _id: req.mongoose_id });
		if (!user) {
			const error = new Error("No user found.");
			error.statusCode = 404;
			throw error;
		}
		await User.updateOne(
			{ _id: req.mongoose_id },
			{
				$set: {
					password,
				},
			}
		);
	} catch (err) {
		next(err);
	}
};
