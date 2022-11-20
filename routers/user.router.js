const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { isAuthenticated, multer } = require("../middlewares");

router.route("/login").post(userController.postLoginUser);

router
	.route("/signup")
	.post(multer.single("picture"), userController.postSignupUser);

router
	.route("/profile")
	.get(isAuthenticated, userController.getUser)
	.put(isAuthenticated, userController.updateUserDetails)
	.patch(isAuthenticated, userController.updateUserPicture);

module.exports = router;
