const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const { promisify } = require('util');
const { generateToken } = require("../middleware/generateToken");


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

//sign up controller
const signUpCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req?.body;

  try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create a new user
      const newUser = new User({
          email,
          password: hashedPassword,
      });

      await newUser.save();
      res.status(201).json({ message: 'Signed up' });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
});

//login
const loginCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req?.body;

  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user?.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

    // Save OTP and expiration time in the user document
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Send OTP to user's email
    const mailOptions = {
      from: 'simmsonhair@gmail.com',
      to: email,
      subject: 'Your OTP for Login',
      text: `Your OTP for login is ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent to your email', email: user?.email });
  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
});


//verify otp
const otpVerifyCtrl = asyncHandler(async (req, res) => {
  const { email, otp } = req?.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is correct, clear OTP fields
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      email: user?.email,
      usertype: user?.userType,
      cart: user?.cart,
      token: generateToken(user?._id),
    });
  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
});


//reset password
const forgotPasswordCtrl = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the reset token before saving it to the database
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set the reset token and expiration time in the user document
    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes
    await user.save();

    // Send the reset token to user's email
    // const resetUrl = `${req?.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: 'simmsonhair@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested a password reset. Please use the following link to reset your password: ${resetUrl}. This link is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//reset password
const resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { resetToken } = req?.params;
  const { newPassword } = req?.body;

  try {
    // Hash the reset token before searching in the database
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find the user by the reset token and check if the token is not expired
    const user = await User.findOne({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set the new password and clear reset token fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Controller function for adding a product to the cart
const addToCartCtrl = asyncHandler(async (req, res) => {
  try {
    const { productId } = req?.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Add product to the user's cart
    req.user.cart.push(product);
    await req.user.save();

    res.status(200).json({ success: true, message: 'Product added to cart successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// Route to view user profile
const userProfileCtrl = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});


// Route to update user profile
const updateProfileCtrl = asyncHandler(async (req, res) => {
  const { email } = req?.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send('User not found');
    }

  
    if (email) user.email = email;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Route to change password
const updatePasswordCtrl = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req?.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).send('Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).send('Password changed successfully');
  } catch (error) {
    res.status(500).send('Server error');
  }
});




module.exports = { signUpCtrl, loginCtrl, forgotPasswordCtrl, resetPasswordCtrl,  addToCartCtrl, userProfileCtrl, updateProfileCtrl, updatePasswordCtrl, otpVerifyCtrl };
