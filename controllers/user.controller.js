const { User } = require("../models");
const { jwtSign, errorChecker, passwordHasher } = require("../utils");
const client = require("../startup/redis");

exports.postLoginUser = async (req, res, next) => {
	const { email, password } = req.body;

	try {
		await client.connect();

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
			email: user.email,
		});

		return res.status(200).json({ message: "Login success!", token });
	} catch (err) {
		next(err);
	} finally {
		await client.disconnect();
	}
};

exports.postSignupUser = async (req, res, next) => {
	const { password, first_name, last_name, email, bio } = req.body;

	try {
		const isUserExisting = await User.findOne({ email });

		errorChecker.isExisting(
			!isUserExisting,
			"User with that email already exist.",
			403
		);
		errorChecker.hasFile(req.file);

		const filePath = req.file.path.split("\\").join("/");
		const hashedPassword = passwordHasher(password);

		await User.create({
			password: hashedPassword,
			first_name,
			last_name,
			email,
			bio,
			birthday: new Date(),
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
	let { email, first_name, last_name } = req.body;

	try {
		const isExisting = await User.findOne({
			email,
			_id: {
				$ne: req.mongoose_id,
			},
		});

		errorChecker.isExisting(
			!isExisting,
			"User with that email already exist.",
			403
		);

		const user = await User.findOneAndUpdate(
			{ _id: req.mongoose_id },
			{
				$set: {
					email,
					first_name,
					last_name,
				},
			}
		);

		errorChecker.isExisting(user, "No user found to update.", 404);

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
					password: passwordHasher(password),
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
