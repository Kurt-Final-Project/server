const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { isAuthenticated, multer, validFields } = require("../middlewares");
const userValidator = require("../validators/user.validator");

router
    .route("/login")
    .post(
        userValidator.emailPassword,
        validFields,
        userController.postLoginUser
    );

router
    .route("/signup")
    .post(
        multer.single("picture"),
        userValidator.userFields,
        userValidator.updateUserPassword,
        validFields,
        userController.postSignupUser
    );

router
    .route("/profile")
    .get(isAuthenticated, userController.getUser)
    .put(
        isAuthenticated,
        userValidator.userFields,
        validFields,
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
        validFields,
        userController.changeUserPassword
    );

module.exports = router;
