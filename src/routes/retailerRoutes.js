const express = require('express');
const retailerController = require('../controllers/retailerController');

const router = express.Router();

// Route to create a new retailer
router.post('/', retailerController.createRetailer);

// Route to get all retailers with pagination
router.get('/', retailerController.getRetailers);

// Route to get a retailer by ID
router.get('/:id', retailerController.getRetailerById);

// Route to update a retailer
router.put('/:id', retailerController.updateRetailer);

// Route to soft delete a retailer
router.delete('/:id', retailerController.deleteRetailer);

// Route to permanently delete a retailer
router.delete('/:id/permanent', retailerController.permanentlyDeleteRetailer);

module.exports = router;