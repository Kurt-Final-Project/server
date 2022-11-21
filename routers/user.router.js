const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { isAuthenticated, multer } = require("../middlewares");
const userValidator = require("../validators/user.validator");

router
    .route("/login")
    .post(userValidator.emailPassword, userController.postLoginUser);

router
    .route("/signup")
    .post(
        multer.single("picture"),
        userValidator.userField,
        userController.postSignupUser
    );

router
    .route("/profile")
    .get(isAuthenticated, userController.getUser)
    .put(
        isAuthenticated,
        userValidator.updateUserFields,
        userController.updateUserDetails
    )
    .patch(
        isAuthenticated,
        multer.single("picture"),
        userController.updateUserPicture
    );

router
    .route("/profile/password")
    .patch(
        isAuthenticated,
        userValidator.updateUserPassword,
        userController.changeUserPassword
    );

module.exports = router;
