const express = require('express');
const retailerController = require('../controllers/retailerController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Route to create a new retailer
router.post('/', retailerController.createRetailer);

// Route to get all retailers with pagination
router.get('/', authMiddleware, adminMiddleware, retailerController.getRetailers);

// Route to get a retailer by ID
router.get('/:id', authMiddleware, retailerController.getRetailerById);

// Route to update a retailer
router.put('/:id', authMiddleware, retailerController.updateRetailer);

// Route to soft delete a retailer
router.delete('/:id', authMiddleware, adminMiddleware, retailerController.deleteRetailer);

// Route to permanently delete a retailer
router.delete('/:id/permanent', authMiddleware, adminMiddleware, retailerController.permanentlyDeleteRetailer);

module.exports = router;