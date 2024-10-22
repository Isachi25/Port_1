const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Route to create a new product
router.post('/', authMiddleware, productController.createProduct);

// Route to get all products with pagination
router.get('/', productController.getProducts);

// Route to get products by category with pagination
router.get('/category/:category', authMiddleware, productController.getProductsByCategory);

// Route to get product by ID
router.get('/:id', authMiddleware, productController.getProductById);

// Route to update product
router.put('/:id', authMiddleware, productController.updateProduct);

// Route to delete product (soft delete)
router.delete('/:id', authMiddleware, productController.deleteProduct);

// Route to permanently delete product
router.delete('/:id/permanent', authMiddleware, productController.permanentlyDeleteProduct);

module.exports = router;