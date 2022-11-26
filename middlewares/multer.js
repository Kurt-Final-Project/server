const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images");
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + "-" + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpeg" ||
		file.mimetype === "image/jpg"
	) {
		cb(null, true);
	} else cb(null, false);
};

const limits = { fileSize: 1024 * 1000 * 5 };

module.exports = multer({ storage, fileFilter, limits });
