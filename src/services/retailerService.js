const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const hashPassword = require('../utils/hashPassword');

// Validation schema
const retailerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  profileImage: Joi.string().required(),
});

// Function to create a new retailer
async function createRetailer(retailer) {
  const { error } = retailerSchema.validate(retailer);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Extract individual fields
    const { name, email, password, profileImage } = retailer;

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    const newRetailer = await prisma.retailer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
      },
    });
    logger.info(`Retailer created: ${newRetailer.id}`);
    return newRetailer;
  } catch (err) {
    logger.error(`Error creating retailer: ${err.message}`);
    throw new Error('Error creating retailer');
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
        profileImage: retailer.profileImage,
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

module.exports = {
  createRetailer,
  getRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
  permanentlyDeleteRetailer,
};