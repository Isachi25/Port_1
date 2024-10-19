const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Validation schema
const orderSchema = Joi.object({
  productId: Joi.string().required(),
  clientName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().required(),
  status: Joi.string().valid('Processing', 'Delivered', 'Cancelled').default('Processing')
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send email
async function sendOrderConfirmationEmail(order) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: 'Order Confirmation',
    text: `Dear ${order.clientName},\n\nYour order has been received. Here are the details:\n\nProduct ID: ${order.productId}\nAddress: ${order.address}\nStatus: ${order.status}\n\nThank you for shopping with us!\n\nBest regards,\nRetailer`
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Order confirmation email sent to: ${order.email}`);
  } catch (err) {
    logger.error(`Error sending email: ${err.message}`);
  }
}

// Function to create a new order
async function createOrder(order) {
  const { error } = orderSchema.validate(order);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const newOrder = await prisma.order.create({
      data: order
    });
    logger.info(`Order created: ${newOrder.id}`);

    // Send order confirmation email
    await sendOrderConfirmationEmail(newOrder);

    return newOrder;
  } catch (err) {
    logger.error(`Error creating order: ${err.message}`);
    throw new Error('Error creating order');
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
        status
      }
    });
    logger.info(`Order updated: ${updatedOrder.id}`);
    return updatedOrder;
  } catch (err) {
    logger.error(`Error updating order: ${err.message}`);
    throw new Error('Error updating order');
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
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  permanentlyDeleteOrder
};