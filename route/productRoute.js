const express = require('express');
const { addProductCtrl,getProductByIdCtrl, editProductCtrl, deleteProductCtrl, getAllProductsCtrl, getFilteredProductsCtrl, } = require('../api/productApi');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware')


const productRoute = express.Router();

productRoute.get('/all',  getAllProductsCtrl);
productRoute.post('/add', addProductCtrl);
productRoute.get('/:id', getProductByIdCtrl);
productRoute.put('/edit/:id', editProductCtrl);
productRoute.delete('/delete/:id', deleteProductCtrl);
productRoute.get('/', getFilteredProductsCtrl);

module.exports = { productRoute };