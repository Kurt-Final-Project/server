const md5 = require("md5");

exports.hasFile = (file) => {
    if (!file) {
        const error = new Error("Picture is required.");
        error.statusCode = 422;
        throw error;
    }
    return;
};

exports.isExisting = (payload, msg, code) => {
    if (!payload) {
        const error = new Error(msg);
        error.statusCode = code;
        throw error;
    }
    return;
};

exports.isAuthorized = (userId, reqId, msg) => {
    if (userId.toString() !== reqId) {
        const error = new Error(msg);
        error.statusCode = 403;
        throw error;
    }
    return;
};

exports.isPasswordCorrect = (userPassword, passwordInput) => {
    if (userPassword !== md5(passwordInput)) {
        const error = new Error("No user found.");
        error.statusCode = 404;
        throw error;
    }
    return;
};
