const authService = require('../services/authService');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/hashPassword');

// Function to create a new user (admin or retailer)
async function createUser(req, res) {
  try {
    let user = { ...req.body };

    // Remove farmName and location if the role is admin
    if (user.role === 'admin') {
      delete user.farmName;
      delete user.location;
    }

    user = await authService.createUser(user);
    logger.info(`User created: ${user.id}`);
    const accessToken = generateToken({ id: user.id });
    res.status(201).json({
      statusCode: 201,
      message: 'User created successfully',
      status: 'success',
      data: user,
      accessToken: accessToken
    });
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to login a user (admin or retailer)
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const token = generateToken({ id: user.id });

    logger.info(`User logged in: ${user.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'User logged in successfully',
      status: 'success',
      data: {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          farmName: user.farmName,
          location: user.location,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get all users with pagination (admin or retailer)
async function getUsers(req, res) {
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

    const role = req.query.role;
    const users = await authService.getUsers(role, value.page, value.limit);
    logger.info(`Fetched ${users.length} users`);
    res.status(200).json({
      statusCode: 200,
      message: 'Users fetched successfully',
      status: 'success',
      data: users
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to get user by ID (admin or retailer)
async function getUserById(req, res) {
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

    const role = req.query.role;
    const user = await authService.getUserById(req.params.id, role);
    if (user) {
      logger.info(`Fetched user: ${user.id}`);
      res.status(200).json({
        statusCode: 200,
        message: 'User fetched successfully',
        status: 'success',
        data: user
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: 'User not found',
        status: 'error',
        data: null
      });
    }
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to update user (admin or retailer)
async function updateUser(req, res) {
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

    let user = { ...req.body };
    user = await authService.updateUser(req.params.id, user);
    logger.info(`User updated: ${user.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'User updated successfully',
      status: 'success',
      data: user
    });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(400).json({
      statusCode: 400,
      message: 'Bad request',
      status: 'error',
      error: error.message
    });
  }
}

// Function to delete user (soft delete)
async function deleteUser(req, res) {
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

    await authService.deleteUser(req.params.id);
    logger.info(`User deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'User deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

// Function to permanently delete user
async function permanentlyDeleteUser(req, res) {
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

    await authService.permanentlyDeleteUser(req.params.id);
    logger.info(`User permanently deleted: ${req.params.id}`);
    res.status(200).json({
      statusCode: 200,
      message: 'User permanently deleted successfully',
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error(`Error permanently deleting user: ${error.message}`);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
      error: error.message
    });
  }
}

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  permanentlyDeleteUser
};