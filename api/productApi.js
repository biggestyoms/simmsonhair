const asyncHandler = require("express-async-handler");
const Product = require("../model/productModel");

// POST route to add a new product
const addProductCtrl = asyncHandler(async (req, res) => {
  try {
    // Extract data from the request
    const { name, price,category, brief, description, image } = req.body;

    // Create a new product
    const newProduct = new Product({
      name,
      category,
      price,
      brief,
      description,
      image,
    });

    // Save the product to the database
    await newProduct.save();

    res
      .status(201)
      .json({ success: true, message: "Product added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//single product
const getProductByIdCtrl = asyncHandler(async (req, res) => {
  try {
    const productId = req?.params?.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


//edit 
const editProductCtrl = asyncHandler(async (req, res) => {
  try {
    const productId = req?.params?.id;
    const { name, category, price, description, image, inStock } = req?.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.name = name;
    product.category = category;
    product.price = price;
    product.inStock = inStock;
    product.description = description;
    product.image = image;


    await product.save();

    res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


//delete product
const deleteProductCtrl = asyncHandler(async (req, res) => {
  try {
    const productId = req?.params?.id;

    // Check if the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete the product
    await product.deleteOne();

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


//fetch all products
const getAllProductsCtrl = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
});

const getFilteredProductsCtrl = asyncHandler(async (req, res) => {
  try {
    let products;
    let query = {};
    if (req?.query?.category && req?.query?.category !== 'All') {
      query = { category: req?.query?.category };
    }

    if(req?.query?.category === 'All' || req?.query?.category === '' || !req?.query?.category){
      products = await Product.find();
    }

    products = await Product.find(query);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});






module.exports = { addProductCtrl, getProductByIdCtrl, editProductCtrl, deleteProductCtrl, getAllProductsCtrl, getFilteredProductsCtrl, };
