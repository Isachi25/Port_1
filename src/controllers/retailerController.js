const retailerService = require('../services/retailerService');
const Joi = require('joi');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/hashPassword');

// Validation schemas
const idSchema = Joi.string().required();
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
});

// Function to create a new retailer
async function createRetailer(req, res) {
  try {
    // Add the file path to the request body
    req.body.profileImage = req.file.path;

    const retailer = await retailerService.createRetailer(req.body);
    logger.info(`Retailer created: ${retailer.id}`);
    res.status(201).json({
      statusCode: 201,
      message: 'Retailer created successfully',
      status: 'success',
      data: retailer
    });
  } catch (error) {
    logger.error(`Error creating retailer: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to login a retailer
async function loginRetailer(req, res) {
  try {
    const { email, password } = req.body;

    const retailer = await retailerService.loginRetailer(email, password);
    const token = generateToken(retailer.id);

    logger.info(`Retailer logged in: ${retailer.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Retailer logged in successfully',
      status: 'success',
      data: {
        token,
        retailer: {
          id: retailer.id,
          name: retailer.name,
          email: retailer.email,
          profileImage: retailer.profileImage,
        },
      },
    });
  } catch (error) {
    logger.error(`Error logging in retailer: ${error.message}`);
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get all retailers with pagination
async function getRetailers(req, res) {
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

    const retailers = await retailerService.getRetailers(value.page, value.limit);
    logger.info(`Fetched ${retailers.length} retailers`);
    res.status(200).json({
      statusCode: 200,
      message: 'Retailers fetched successfully',
      status: 'success',
      data: retailers
    });
  } catch (error) {
    logger.error(`Error fetching retailers: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get retailer by ID
async function getRetailerById(req, res) {
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

    const retailer = await retailerService.getRetailerById(req.params.id);
    if (retailer) {
      logger.info(`Fetched retailer: ${retailer.id}`);
      res.status(200).json({
        statusCode: 200,
        message: 'Retailer fetched successfully',
        status: 'success',
        data: retailer
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Retailer not found',
        status: 'error',
        data: null
      });
    }
  } catch (error) {
    logger.error(`Error fetching retailer: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to update retailer
async function updateRetailer(req, res) {
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

    // Add the file path to the request body
    if (req.file) {
      req.body.profileImage = req.file.path;
    }

    const retailer = await retailerService.updateRetailer(req.params.id, req.body);
    logger.info(`Retailer updated: ${retailer.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Retailer updated successfully',
      status: 'success',
      data: retailer
    });
  } catch (error) {
    if (error.message === 'Retailer not found') {
      res.status(404).json({
        statusCode: 404,
        message: 'Retailer not found',
        status: 'error',
        error: error.message
      });
    } else {
      logger.error(`Error updating retailer: ${error.message}`);
      res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }
  }
}

// Function to delete retailer (soft delete)
async function deleteRetailer(req, res) {
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

    const deletedRetailer = await retailerService.deleteRetailer(req.params.id);
    logger.info(`Retailer deleted: ${deletedRetailer.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Retailer deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error deleting retailer: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to permanently delete retailer
async function permanentlyDeleteRetailer(req, res) {
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

    await retailerService.permanentlyDeleteRetailer(req.params.id);
    logger.info(`Retailer permanently deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Retailer permanently deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error permanently deleting retailer: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

module.exports = {
  createRetailer,
  loginRetailer,
  getRetailers,
  getRetailerById,
  updateRetailer,
  deleteRetailer,
  permanentlyDeleteRetailer
};