const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Route to create a new order
router.post('/', orderController.createOrder);

// Route to get all orders
router.get('/', orderController.getOrders);

// Route to get order by ID
router.get('/:id', orderController.getOrderById);

// Route to update order
router.put('/:id', orderController.updateOrder);

// Route to soft delete order
router.delete('/:id', orderController.deleteOrder);

// Route to permanently delete order
router.delete('/:id/permanent', orderController.permanentlyDeleteOrder);

module.exports = router;
