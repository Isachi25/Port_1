const adminService = require('../services/adminService');
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schemas
const idSchema = Joi.string().required();
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).default(10),
});

// Function to create a new admin
async function createAdmin(req, res) {
  try {
    const admin = await adminService.createAdmin(req.body);
    logger.info(`Admin created: ${admin.id}`);
    res.status(201).json({
      statusCode: 201,
      message: 'Admin created successfully',
      status: 'success',
      data: admin
    });
  } catch (error) {
    logger.error(`Error creating admin: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get all admins with pagination
async function getAdmins(req, res) {
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

    const admins = await adminService.getAdmins(value.page, value.limit);
    logger.info(`Fetched ${admins.length} admins`);
    res.status(200).json({
      statusCode: 200,
      message: 'Admins fetched successfully',
      status: 'success',
      data: admins
    });
  } catch (error) {
    logger.error(`Error fetching admins: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get admin by ID
async function getAdminById(req, res) {
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

    const admin = await adminService.getAdminById(req.params.id);
    if (admin) {
      logger.info(`Fetched admin: ${admin.id}`);
      res.status(200).json({
        statusCode: 200,
        message: 'Admin fetched successfully',
        status: 'success',
        data: admin
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'Admin not found',
        status: 'error',
        data: null
      });
    }
  } catch (error) {
    logger.error(`Error fetching admin: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to update admin
async function updateAdmin(req, res) {
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

    const admin = await adminService.updateAdmin(req.params.id, req.body);
    logger.info(`Admin updated: ${admin.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Admin updated successfully',
      status: 'success',
      data: admin
    });
  } catch (error) {
    if (error.message === 'Admin not found') {
      res.status(404).json({
        statusCode: 404,
        message: 'Admin not found',
        status: 'error',
        error: error.message
      });
    } else {
      logger.error(`Error updating admin: ${error.message}`);
      res.status(400).json({
        statusCode: 400,
        message: 'Bad request',
        status: 'error',
        error: error.message
      });
    }
  }
}

// Function to delete admin (soft delete)
async function deleteAdmin(req, res) {
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

    await adminService.deleteAdmin(req.params.id);
    logger.info(`Admin deleted: ${req.params.id}`);
    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting admin: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to permanently delete admin
async function permanentlyDeleteAdmin(req, res) {
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

    await adminService.permanentlyDeleteAdmin(req.params.id);
    logger.info(`Admin permanently deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'Admin permanently deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error permanently deleting admin: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

module.exports = {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  permanentlyDeleteAdmin
};