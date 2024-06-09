const express = require('express');
const { addProductCtrl,getProductByIdCtrl, editProductCtrl, deleteProductCtrl, getAllProductsCtrl, getFilteredProductsCtrl, } = require('../api/productApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')


const productRoute = express.Router();

productRoute.get('/all',  getAllProductsCtrl);
productRoute.post('/add',authMiddleware, adminMiddleware, addProductCtrl);
productRoute.get('/:id', getProductByIdCtrl);
productRoute.put('/edit/:id',authMiddleware, adminMiddleware, editProductCtrl);
productRoute.delete('/delete/:id',authMiddleware, adminMiddleware, deleteProductCtrl);
productRoute.get('/', getFilteredProductsCtrl);

module.exports = { productRoute };