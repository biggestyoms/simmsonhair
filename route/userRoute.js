const express = require('express');
const { signUpCtrl, loginCtrl, addToCartCtrl, userProfileCtrl, updateProfileCtrl, updatePasswordCtrl } = require('../api/userApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

const userRoute = express.Router();

userRoute.post('/register', signUpCtrl);
userRoute.post('/login', loginCtrl);
userRoute.post('/cart/add',authMiddleware, addToCartCtrl);
userRoute.get('/profile',authMiddleware, userProfileCtrl);
userRoute.put('/profile',authMiddleware, updateProfileCtrl);
userRoute.put('/change-password',authMiddleware, updatePasswordCtrl);

module.exports = { userRoute };