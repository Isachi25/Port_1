const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schema
const productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  availability: Joi.boolean().required(),
  description: Joi.string().required(),
  image: Joi.string().required(),
  retailerId: Joi.string().required(),
  category: Joi.string().valid('Poultry', 'Dairy', 'Serials', 'Vegetables', 'Fruits').required()
});

// Function to create a new product
async function createProduct(product) {
  const { error } = productSchema.validate(product);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Extract individual fields
    const { name, price, availability, description, image, retailerId, category } = product;

    // Ensure price is a float
    const priceFloat = parseFloat(price);

    const newProduct = await prisma.product.create({
      data: {
        name,
        price: priceFloat,
        availability,
        description,
        image,
        retailerId,
        category
      }
    });
    logger.info(`Product created: ${newProduct.id}`);
    return newProduct;
  } catch (err) {
    logger.error(`Error creating product: ${err.message}`);
    throw new Error('Error creating product');
  }
}

// Function to get all products with pagination
async function getProducts(page = 1, limit = 10) {
  try {
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit
    });
    logger.info(`Fetched ${products.length} products`);
    return products;
  } catch (err) {
    logger.error(`Error fetching products: ${err.message}`);
    throw new Error('Error fetching products');
  }
}

// Function to get products by category
async function getProductsByCategory(category, page = 1, limit = 10) {
  const categorySchema = Joi.string().valid('Poultry', 'Dairy', 'Serials', 'Vegetables', 'Fruits').required();
  const { error } = categorySchema.validate(category);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        category
      },
      skip: (page - 1) * limit,
      take: limit
    });
    logger.info(`Fetched ${products.length} products in category ${category}`);
    return products;
  } catch (err) {
    logger.error(`Error fetching products by category: ${err.message}`);
    throw new Error('Error fetching products by category');
  }
}

// Function to get product by ID
async function getProductById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id
      }
    });

    if (!product || product.deletedAt) {
      throw new Error('Product not found');
    }

    logger.info(`Fetched product: ${product.id}`);
    return product;
  } catch (err) {
    logger.error(`Error fetching product: ${err.message}`);
    throw new Error('Error fetching product');
  }
}

// Function to update product
async function updateProduct(id, product) {
  const { error } = productSchema.validate(product);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id
      }
    });

    if (!existingProduct || existingProduct.deletedAt) {
      throw new Error('Product not found');
    }

    // Extract individual fields
    const { name, price, availability, description, image, retailerId, category } = product;

    // Ensure price is a float
    const priceFloat = parseFloat(price);

    const updatedProduct = await prisma.product.update({
      where: {
        id
      },
      data: {
        name,
        price: priceFloat,
        availability,
        description,
        image,
        retailerId,
        category
      }
    });
    logger.info(`Product updated: ${updatedProduct.id}`);
    return updatedProduct;
  } catch (err) {
    logger.error(`Error updating product: ${err.message}`);
    throw new Error('Error updating product');
  }
}

// Function to delete product (soft delete)
async function deleteProduct(id) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id
      }
    });

    if (!existingProduct || existingProduct.deletedAt) {
      throw new Error('Product not found');
    }

    const deletedProduct = await prisma.product.update({
      where: {
        id
      },
      data: {
        deletedAt: new Date()
      }
    });
    logger.info(`Product deleted: ${deletedProduct.id}`);
    return deletedProduct;
  } catch (err) {
    logger.error(`Error deleting product: ${err.message}`);
    throw new Error('Error deleting product');
  }
}

// Function to permanently delete product
async function permanentlyDeleteProduct(id) {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {
        id
      }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    const deletedProduct = await prisma.product.delete({
      where: {
        id
      }
    });
    logger.info(`Product permanently deleted: ${deletedProduct.id}`);
    return deletedProduct;
  } catch (err) {
    logger.error(`Error permanently deleting product: ${err.message}`);
    throw new Error('Error permanently deleting product');
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  permanentlyDeleteProduct
};