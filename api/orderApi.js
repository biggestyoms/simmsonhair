const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const Order = require('../model/orderModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

// Route to create an order
const createOrderCtrl = asyncHandler(async (req, res) => {
    const { products } = req?.body;
    const userId = req?.user?._id;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      let totalAmount = 0;
      const orderProducts = await Promise.all(products.map(async item => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error('Product not found');
        }
        totalAmount += product.price * item.quantity;
        return {
          product: product._id,
          quantity: item.quantity
        };
      }));
  
      const order = new Order({
        user: user._id,
        products: orderProducts,
        totalAmount
      });
  
      await order.save();
  
      res.status(201).json(order);
    } catch (error) {
      res.status(500).send('Server error');
    }
});


// view order
const viewOrderCtrl = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    try {
      const orders = await Order.find({ user: userId }).populate('products.product');
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).send('Server error');
    }
});

// view order details
const orderDetailsCtrl = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    try {
      const order = await Order.findById(orderId).populate('products.product');
      if (!order) {
        return res.status(404).send('Order not found');
      }
      res.status(200).json(order);
    } catch (error) {
      res.status(500).send('Server error');
    }
});


//fetch all orders
const getAllOrdersCtrl = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 5, orderId } = req.query;
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);

  try {
    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (orderId) {
      filter._id = orderId;
    }

    const totalOrders = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user')
      .populate('products.product')
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(totalOrders / pageSize),
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});






// Update order status
const updateOrderStatusCtrl = asyncHandler(async (req, res) => {
  const { orderId, status } = req?.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// view order details
const updateOrderCtrl = asyncHandler(async (req, res) => {
    const { orderId } = req?.params;
    const { status } = req?.body;
  
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).send('Order not found');
      }
  
      order.status = status;
      order.updatedAt = Date.now();
  
      await order.save();
  
      res.status(200).json(order);
    } catch (error) {
      res.status(500).send('Server error');
    }
});




module.exports = { createOrderCtrl, viewOrderCtrl, orderDetailsCtrl, updateOrderCtrl,  updateOrderStatusCtrl, getAllOrdersCtrl };
