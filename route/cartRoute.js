const express = require('express');
const { addToCartCtrl, userCartCtrl, deleteCartCtrl, quantityCartCtrl, decrementCartCtrl, incrementCartCtrl } = require('../api/cartApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')


const cartRoute = express.Router();

cartRoute.post('/',authMiddleware, addToCartCtrl);
cartRoute.get('/',authMiddleware, userCartCtrl);
cartRoute.delete('/delete',authMiddleware, deleteCartCtrl);
cartRoute.put('/quantity',authMiddleware, quantityCartCtrl);
cartRoute.put('/increment', authMiddleware, incrementCartCtrl);
cartRoute.put('/decrement', authMiddleware, decrementCartCtrl);

module.exports = { cartRoute };