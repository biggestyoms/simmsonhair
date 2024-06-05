const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");
const User = require("../model/userModel");


const addToCartCtrl = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req?.body; // Destructure quantity with default value of 1
  const userId = req?.user?._id;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Check if the product is already in the cart
    const cartItem = user.cart.find(item => item.product.equals(product?._id));
    if (cartItem) {
      // If the product is already in the cart, increase the quantity
      cartItem.quantity += quantity;
    } else {
      // If the product is not in the cart, add it with the specified quantity
      user.cart.push({ product: product._id, quantity });
    }

    await user.save();

    res.status(200).send('Product added to cart');
  } catch (error) {
    res.status(500).send('Server error');
  }
});


//view cart
const userCartCtrl = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  try {
    const user = await User.findById(userId).populate('cart.product');
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).send('Server error');
  }
  });


  //dlete product from cart
const deleteCartCtrl = asyncHandler(async (req, res) => {
    const { productId } = req?.body;
    const userId = req?.user?._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      user.cart = user.cart.filter(item => !item.product.equals(productId));
  
      await user.save();
  
      res.status(200).send('Product removed from cart');
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

  //quantity
const quantityCartCtrl = asyncHandler(async (req, res) => {
    const { productId } = req?.body;
    const { quantity } = req?.body;
    const userId = req?.user?._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const cartItem = user.cart.find(item => item.product.equals(productId));
      if (!cartItem) {
        return res.status(404).send('Product not found in cart');
      }
  
      cartItem.quantity = quantity;
  
      await user.save();
  
      res.status(200).send('Product quantity updated');
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

  const incrementCartCtrl = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const cartItem = user.cart.find(item => item.product.equals(productId));
      if (cartItem) {
        cartItem.quantity += 1;
        await user.save();
        return res.status(200).send('Product quantity incremented');
      } else {
        return res.status(404).send('Product not found in cart');
      }
    } catch (error) {
      res.status(500).send('Server error');
    }
  });

  const decrementCartCtrl = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const cartItem = user.cart.find(item => item.product.equals(productId));
      if (cartItem) {
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
          await user.save();
          return res.status(200).send('Product quantity decremented');
        } else {
          user.cart = user.cart.filter(item => !item.product.equals(productId));
          await user.save();
          return res.status(200).send('Product removed from cart');
        }
      } else {
        return res.status(404).send('Product not found in cart');
      }
    } catch (error) {
      res.status(500).send('Server error');
    }
  });
  
  
  module.exports = { addToCartCtrl, userCartCtrl, deleteCartCtrl, quantityCartCtrl, incrementCartCtrl, decrementCartCtrl } 