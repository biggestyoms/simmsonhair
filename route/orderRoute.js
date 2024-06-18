const express = require('express');
const { createOrderCtrl, viewOrderCtrl, orderDetailsCtrl, updateOrderStatusCtrl, getAllOrdersCtrl } = require('../api/orderApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')


const orderRoute = express.Router();

orderRoute.post('/',authMiddleware, createOrderCtrl);
orderRoute.get('/user',authMiddleware, viewOrderCtrl);
orderRoute.get('/all',authMiddleware, adminMiddleware, getAllOrdersCtrl);
orderRoute.put('/updateStatus',authMiddleware, adminMiddleware, updateOrderStatusCtrl);
orderRoute.get('/:orderId',authMiddleware, orderDetailsCtrl);



module.exports = { orderRoute };

