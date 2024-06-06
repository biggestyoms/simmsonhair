const express = require('express');
const { processPaymentCtrl } = require('../api/paymentApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')

const paymentRoute = express.Router();

paymentRoute.post('/', authMiddleware, processPaymentCtrl);


module.exports = { paymentRoute };

