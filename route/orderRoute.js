const express = require('express');
const { createOrderCtrl, viewOrderCtrl, orderDetailsCtrl, updateOrderStatusCtrl, getAllOrdersCtrl} = require('../api/orderApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')


const orderRoute = express.Router();

orderRoute.post('/',authMiddleware, createOrderCtrl);
orderRoute.get('/user',authMiddleware, viewOrderCtrl);
orderRoute.get('/:orderId',authMiddleware, orderDetailsCtrl);
orderRoute.put('/updateStatus',authMiddleware, adminMiddleware, updateOrderStatusCtrl);
orderRoute.get('/all',authMiddleware, adminMiddleware, getAllOrdersCtrl);



module.exports = { orderRoute };

