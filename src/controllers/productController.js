const productService = require('../services/productService');
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const idSchema = Joi.string().required();
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10)
});

// Function to create a new product
async function createProduct (req, res) {
  try {
    const product = await productService.createProduct(req.body);
    logger.info(`Product created: ${product.id}`);
    res.status(201).json({
      statusCode: 201,
      message: 'Product created successfully',
      status: 'success',
      data: product
    });
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get all products with pagination
async function getProducts (req, res) {
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

    const products = await productService.getProducts(value.page, value.limit);
    logger.info(`Fetched ${products.length} products`);
    res.status(200).json({
      statusCode: 200,
      message: 'Products fetched successfully',
      status: 'success',
      data: products
    });
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get product by ID
async function getProductById (req, res) {
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

    const product = await productService.getProductById(req.params.id);
    if (product) {
      logger.info(`Fetched product: ${product.id}`);
      res.status(200).json({
        statusCode: 200,
        message: 'Product fetched successfully',
        status: 'success',
        data: product
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Product not found',
        status: 'error',
        data: null
      });
    }
  } catch (error) {
    logger.error(`Error fetching product: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to update product
async function updateProduct (req, res) {
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

    const product = await productService.updateProduct(req.params.id, req.body);
    logger.info(`Product updated: ${product.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Product updated successfully',
      status: 'success',
      data: product
    });
  } catch (error) {
    logger.error(`Error updating product: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to delete product (soft delete)
async function deleteProduct (req, res) {
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

    await productService.deleteProduct(req.params.id);
    logger.info(`Product deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Product deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error deleting product: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to permanently delete product
async function permanentlyDeleteProduct (req, res) {
  try {
    const { error } = idSchema.validate(req.params.id);
    if (error) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        data: null
      });
    }

    await productService.permanentlyDeleteProduct(req.params.id);
    logger.info(`Product permanently deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Product permanently deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error permanently deleting product: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  permanentlyDeleteProduct
};
