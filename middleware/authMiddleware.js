const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
const User = require("../model/userModel");

dotenv.config();

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token = req?.headers?.authorization?.split(" ")[1];
        try {
            if (token) {
                const decodedUser = jwt.verify(token, process.env.JWT_KEY);
                const user = await User.findById(decodedUser?.id);
                if (!user) {
                    throw new Error("User not found.");
                }
                req.user = user;
                next();
            }
        } catch (error) {
            res.status(401);
            throw new Error("Not authorized, token expired.");
        }
    } else {
        res.status(401);
        throw new Error("There is no token attached to the header.");
    }
});

const adminMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized as an admin.");
    }
});

module.exports = { authMiddleware, adminMiddleware };



