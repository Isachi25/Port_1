const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const {
  hashPassword,
  verifyPassword,
} = require('../utils/hashPassword');

// Validation schema for retailer
const retailerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  farmName: Joi.string().required(),
  location: Joi.string().required(),
});

// Validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Function to create a new retailer
async function createRetailer(retailer) {
  const { error } = retailerSchema.validate(retailer);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if retailer with the same email already exists
    const existingRetailer = await prisma.retailer.findUnique({
      where: {
        email: retailer.email,
      },
    });

    if (existingRetailer) {
      throw new Error('Email already in use');
    }

    // Extract individual fields
    const { name, email, password, farmName, location } = retailer;

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    const newRetailer = await prisma.retailer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        farmName,
        location,
      },
    });
    logger.info(`Retailer created: ${newRetailer.id}`);
    return newRetailer;
  } catch (err) {
    logger.error(`Error creating retailer: ${err.message}`);
    throw new Error(`Error creating retailer: ${err.message}`);
  }
}

// Function to login a retailer
async function loginRetailer(email, password) {
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const retailer = await prisma.retailer.findUnique({
      where: {
        email,
      },
    });

    if (!retailer || retailer.deletedAt) {
      throw new Error('Invalid email or password');
    }

    const isPasswordMatch = await verifyPassword(password, retailer.password);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    logger.info(`Retailer logged in: ${retailer.id}`);
    return retailer;
  } catch (err) {
    logger.error(`Error logging in retailer: ${err.message}`);
    throw new Error('Error logging in retailer');
  }
}

// Function to get all retailers with pagination
async function getRetailers(page = 1, limit = 10) {
  try {
    const retailers = await prisma.retailer.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    logger.info(`Fetched ${retailers.length} retailers`);
    return retailers;
  } catch (err) {
    logger.error(`Error fetching retailers: ${err.message}`);
    throw new Error('Error fetching retailers');
  }
}

// Function to get retailer by ID
async function getRetailerById(id) {
  try {
    const retailer = await prisma.retailer.findUnique({
      where: {
        id: id,
      },
    });

    if (!retailer || retailer.deletedAt) {
      throw new Error('Retailer not found');
    }

    logger.info(`Fetched retailer: ${retailer.id}`);
    return retailer;
  } catch (err) {
    logger.error(`Error fetching retailer: ${err.message}`);
    throw new Error('Error fetching retailer');
  }
}

// Function to update retailer
async function updateRetailer(id, retailer) {
  const { error } = retailerSchema.validate(retailer);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if retailer exists
    const existingRetailer = await prisma.retailer.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingRetailer || existingRetailer.deletedAt) {
      throw new Error('Retailer not found');
    }

    if (retailer.password) {
      retailer.password = await hashPassword(retailer.password);
    }

    const updatedRetailer = await prisma.retailer.update({
      where: {
        id: id,
      },
      data: {
        name: retailer.name,
        email: retailer.email,
        password: retailer.password,
        farmName: retailer.farmName,
        location: retailer.location,
      },
    });
    logger.info(`Retailer updated: ${updatedRetailer.id}`);
    return updatedRetailer;
  } catch (err) {
    logger.error(`Error updating retailer: ${err.message}`);
    throw new Error('Error updating retailer');
  }
}

// Function to delete retailer (soft delete)
async function deleteRetailer(id) {
  try {
    const deletedRetailer = await prisma.retailer.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    logger.info(`Retailer deleted: ${deletedRetailer.id}`);
    return deletedRetailer;
  } catch (err) {
    logger.error(`Error deleting retailer: ${err.message}`);
    throw new Error('Error deleting retailer');
  }
}

// Function to permanently delete retailer
async function permanentlyDeleteRetailer(id) {
  try {
    const existingRetailer = await prisma.retailer.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingRetailer) {
      throw new Error('Retailer not found');
    }

    const deletedRetailer = await prisma.retailer.delete({
      where: {
        id: id,
      },
    });
    logger.info(`Retailer permanently deleted: ${deletedRetailer.id}`);
    return deletedRetailer;
  } catch (err) {
    logger.error(`Error permanently deleting retailer: ${err.message}`);
    throw new Error('Error permanently deleting retailer');
  }
}

// Function to get all products with pagination
async function getProducts(page = 1, limit = 10) {
  try {
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
    logger.info(`Fetched ${products.length} products`);
    return products;
  } catch (err) {
    logger.error(`Error fetching products: ${err.message}`);
    throw new Error('Error fetching products');
  }
}

// Function to get all products without pagination
async function getAllProducts() {
  try {
    const products = await prisma.product.findMany();
    logger.info(`Fetched ${products.length} products`);
    return products;
  } catch (err) {
    logger.error(`Error fetching products: ${err.message}`);
    throw new Error('Error fetching products');
  }
}

module.exports = {
  createRetailer,
  loginRetailer,
  getRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
  permanentlyDeleteRetailer,
  getProducts,
  getAllProducts,
};