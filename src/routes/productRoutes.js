const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route to create a new product
router.post('/', productController.createProduct);

// Route to get all products with pagination
router.get('/', productController.getProducts);

// Route to get product by ID
router.get('/:id', productController.getProductById);

// Route to update product
router.put('/:id', productController.updateProduct);

// Route to delete product (soft delete)
router.delete('/:id', productController.deleteProduct);

// Route to permanently delete product
router.delete('/permanent/:id', productController.permanentlyDeleteProduct);

module.exports = router;
