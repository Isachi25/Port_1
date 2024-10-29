const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const { sendEmail, generateOrderConfirmationEmail } = require('./emailService');

// Validation schema for a single order
const singleOrderSchema = Joi.object({
  productId: Joi.string().required(),
  clientName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  status: Joi.string().valid('Processing', 'Delivered', 'Cancelled').default('Processing'),
  quantity: Joi.number().integer().min(1).required()
});

// Validation schema for multiple orders
const multipleOrdersSchema = Joi.array().items(singleOrderSchema).min(1);

// Function to create new orders
async function createOrders(orders) {
  const { error } = multipleOrdersSchema.validate(orders);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const createdOrders = [];

    for (const order of orders) {
      const product = await prisma.product.findUnique({
        where: { id: order.productId }
      });

      if (!product) {
        throw new Error(`Product with ID ${order.productId} not found`);
      }

      const totalPrice = product.price * order.quantity;

      const newOrder = await prisma.order.create({
        data: {
          clientName: order.clientName,
          phoneNumber: order.phoneNumber,
          email: order.email,
          address: order.address,
          status: order.status,
          quantity: order.quantity,
          totalPrice: totalPrice,
          product: {
            connect: { id: order.productId }
          }
        },
        include: {
          product: true
        }
      });
      logger.info(`Order created: ${newOrder.id}`);
      createdOrders.push(newOrder);
    }

    // Generate email template and send order confirmation email
    const mailOptions = generateOrderConfirmationEmail(createdOrders);
    await sendEmail(mailOptions);

    return createdOrders;
  } catch (err) {
    logger.error(`Error creating orders: ${err.message}`);
    throw new Error('Error creating orders');
  }
}

// Function to update order
async function updateOrder(id, order) {
  const { error } = orderSchema.validate(order);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id
      }
    });

    if (!existingOrder || existingOrder.deletedAt) {
      throw new Error('Order not found');
    }

    // Extract individual fields
    const { productId, clientName, phoneNumber, email, address, status } = order;

    const updatedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        productId,
        clientName,
        phoneNumber,
        email,
        address,
        status,
        product: {
          connect: { id: productId }
        }
      }
    });
    logger.info(`Order updated: ${updatedOrder.id}`);
    return updatedOrder;
  } catch (err) {
    logger.error(`Error updating order: ${err.message}`);
    throw new Error('Error updating order');
  }
}

// Function to get all orders with pagination
async function getOrders (page = 1, limit = 10) {
  try {
    const orders = await prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    logger.info(`Fetched ${orders.length} orders`);
    return orders;
  } catch (err) {
    logger.error(`Error fetching orders: ${err.message}`);
    throw new Error('Error fetching orders');
  }
}

// Function to get order by ID
async function getOrderById (id) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id
      },
      include: {
        product: true
      }
    });

    if (!order || order.deletedAt) {
      throw new Error('Order not found');
    }

    if (!order.product) {
      throw new Error('Product information is missing for this order');
    }

    logger.info(`Fetched order: ${order.id}`);
    return order;
  } catch (err) {
    logger.error(`Error fetching order: ${err.message}`);
    throw new Error('Error fetching order');
  }
}

// Function to delete order (soft delete)
async function deleteOrder (id) {
  try {
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: {
        id
      }
    });

    if (!existingOrder || existingOrder.deletedAt) {
      throw new Error('Order not found');
    }
    const deletedOrder = await prisma.order.update({
      where: {
        id
      },
      data: {
        deletedAt: new Date()
      }
    });
    logger.info(`Order deleted: ${deletedOrder.id}`);
    return deletedOrder;
  } catch (err) {
    logger.error(`Error deleting order: ${err.message}`);
    throw new Error('Error deleting order');
  }
}

// Function to permanently delete order
async function permanentlyDeleteOrder (id) {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: {
        id
      }
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const deletedOrder = await prisma.order.delete({
      where: {
        id
      }
    });
    logger.info(`Order permanently deleted: ${deletedOrder.id}`);
    return deletedOrder;
  } catch (err) {
    logger.error(`Error permanently deleting order: ${err.message}`);
    throw new Error('Error permanently deleting order');
  }
}

module.exports = {
  createOrders,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  permanentlyDeleteOrder
};