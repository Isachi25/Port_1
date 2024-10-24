const orderService = require('../services/orderService');
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const idSchema = Joi.string().required();
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

// Function to create a new order
async function createOrder(req, res) {
  try {
    const order = await orderService.createOrder(req.body);
    logger.info(`Order created: ${order.id}`);
    res.status(201).json({
      statusCode: 201,
      message: 'Order created successfully',
      status: 'success',
      data: order
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to update order
async function updateOrder(req, res) {
  try {
    const { error } = idSchema.validate(req.params.id);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }

    const order = await orderService.updateOrder(req.params.id, req.body);
    logger.info(`Order updated: ${order.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Order updated successfully',
      status: 'success',
      data: order
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      res.status(404).json({
        statusCode: 404,
        message: 'Order not found',
        status: 'error',
        error: error.message
      });
    } else if (error.message.startsWith('Validation error')) {
      res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    } else {
      logger.error(`Error updating order: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        status: 'error',
        error: error.message
      });
    }
  }
}

// Function to get all orders with pagination
async function getOrders (req, res) {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }

    const orders = await orderService.getOrders(value.page, value.limit);
    logger.info(`Fetched ${orders.length} orders`);
    res.status(200).json({
      statusCode: 200,
      message: 'Orders fetched successfully',
      status: 'success',
      data: orders
    });
  } catch (error) {
    logger.error(`Error fetching orders: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get order by ID
async function getOrderById (req, res) {
  try {
    const { error } = idSchema.validate(req.params.id);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }

    const order = await orderService.getOrderById(req.params.id);
    if (order) {
      logger.info(`Fetched order: ${order.id}`);
      res.status(200).json({
        statusCode: 200,
        message: 'Order fetched successfully',
        status: 'success',
        data: order
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Order not found',
        status: 'error',
        data: null
      });
    }
  } catch (error) {
    logger.error(`Error fetching order: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to delete order (soft delete)
async function deleteOrder (req, res) {
  try {
    const { error } = idSchema.validate(req.params.id);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }

    await orderService.deleteOrder(req.params.id);
    logger.info(`Order deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Order deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      res.status(404).json({
        statusCode: 404,
        message: 'Order not found',
        status: 'error',
        data: null
      });
    } else {
      logger.error(`Error deleting order: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        status: 'error',
        error: error.message
      });
    }
  }
}

// Function to permanently delete order
async function permanentlyDeleteOrder (req, res) {
  try {
    const { error } = idSchema.validate(req.params.id);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }

    await orderService.permanentlyDeleteOrder(req.params.id);
    logger.info(`Order permanently deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Order permanently deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      res.status(404).json({
        statusCode: 404,
        message: 'Order not found',
        status: 'error',
        data: null
      });
    } else {
      logger.error(`Error permanently deleting order: ${error.message}`);
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        status: 'error',
        error: error.message
      });
    }
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  permanentlyDeleteOrder
};
