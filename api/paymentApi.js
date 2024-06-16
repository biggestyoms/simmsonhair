const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Payment = require('../model/paymentModel');
const { Client, Environment } = require('square');
const dotenv = require("dotenv");

dotenv.config();  

// Initialize the Square client
const client = new Client({
  environment: Environment.Production, // Change to Production for live
  accessToken: process.env.SQUARE_ACCESS_TOKEN, 
});

const { paymentsApi } = client;

// Function to process payment using Square

const processSquarePayment = async (token, amount) => {
  try {
    const response = await paymentsApi.createPayment({
      sourceId: token,
      amountMoney: {
        amount: amount * 100, // Square expects amount in cents
        currency: 'CAD',
      },
      idempotencyKey: `${new Date().getTime().toString()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    return {
      status: 'success',
      transactionId: response.result.payment.id,
    };
  } catch (error) {
    console.error('Square payment error:', error);
    return {
      status: 'failed',
      errors: error.errors,
    };
  }
};


// Route to process payment
const processPaymentCtrl = asyncHandler(async (req, res) => {
  const { token, amount, cartItems, userInfo } = req.body;

  if (!token || !amount || !Array.isArray(cartItems) || !userInfo) {
    return res.status(400).json({ message: 'Invalid request data' });
  }

  const userId = req.user._id;

  try {
    // Process the payment using Square
    const paymentResponse = await processSquarePayment(token, amount);
    
    if (paymentResponse.status !== 'success') {
      return res.status(400).json({ message: 'Payment failed', errors: paymentResponse.errors });
    }

    // If payment is successful, save payment details to database
    const payment = new Payment({
      user: userId,
      amount,
      transactionId: paymentResponse.transactionId,
      status: paymentResponse.status,
    });

    await payment.save();

    // Clear the user's cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.cart = [];
    await user.save();

    res.status(200).json({ message: 'Payment processed and cart cleared' });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { processPaymentCtrl };
