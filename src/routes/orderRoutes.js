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

// Route to delete order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
