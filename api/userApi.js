const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


const { generateToken } = require("../middleware/generateToken");


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



//login controller
const loginCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req?.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid password' });
      }
  
      res.status(200).json({
        message: "Login successful",
        email: user?.email,
        usertype: user?.userType,
        cart: user?.cart,
        token: generateToken(user?._id),
        alert: true,
      });
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




module.exports = { signUpCtrl, loginCtrl, addToCartCtrl, userProfileCtrl, updateProfileCtrl, updatePasswordCtrl };
