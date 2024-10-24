const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');

// Validation schema for admin
const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('admin').default('admin')
});

// Validation schema for retailer
const retailerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  farmName: Joi.string().required(),
  location: Joi.string().required(),
  role: Joi.string().valid('retailer').default('retailer')
});

// Validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Function to create a new user (admin or retailer)
async function createUser(user, schema) {
  const { error } = schema.validate(user);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    console.log(existingUser);

    if (existingUser) {
      throw new Error('User with the same email already exists');
    }

    // Extract individual fields
    const { name, email, password, farmName, location, role } = user;

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        farmName,
        location,
        role
      },
    });
    logger.info(`User created: ${newUser.id}`);
    return newUser;
  } catch (err) {
    logger.error(`Error creating user: ${err.message}`);
    throw new Error(`Error creating user: ${err.message}`);
  }
}

// Function to login a user (admin or retailer)
async function loginUser(email, password) {
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || user.deletedAt) {
      throw new Error('Invalid email or password');
    }

    const isPasswordMatch = await verifyPassword(password, user.password);
    if (!isPasswordMatch) {
      throw new Error('Invalid email or password');
    }

    logger.info(`User logged in: ${user.id}`);
    return user;
  } catch (err) {
    logger.error(`Error logging in user: ${err.message}`);
    throw new Error('Error logging in user');
  }
}

// Function to get all users with pagination (admin or retailer)
async function getUsers(role, page = 1, limit = 10) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: role,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    logger.info(`Fetched ${users.length} users`);
    return users;
  } catch (err) {
    logger.error(`Error fetching users: ${err.message}`);
    throw new Error('Error fetching users');
  }
}

// Function to get user by ID (admin or retailer)
async function getUserById(id, role) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user || user.deletedAt || user.role !== role) {
      throw new Error('User not found');
    }

    logger.info(`Fetched user: ${user.id}`);
    return user;
  } catch (err) {
    logger.error(`Error fetching user: ${err.message}`);
    throw new Error('Error fetching user');
  }
}

// Function to update user (admin or retailer)
async function updateUser(id, user, schema) {
  const { error } = schema.validate(user);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser || existingUser.deletedAt || existingUser.role !== user.role) {
      throw new Error('User not found');
    }

    if (user.password) {
      user.password = await hashPassword(user.password);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        farmName: user.farmName,
        location: user.location,
        profileImage: user.profileImage,
        role: user.role
      },
    });
    logger.info(`User updated: ${updatedUser.id}`);
    return updatedUser;
  } catch (err) {
    logger.error(`Error updating user: ${err.message}`);
    throw new Error('Error updating user');
  }
}

// Function to delete user (soft delete)
async function deleteUser(id) {
  try {
    const deletedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    logger.info(`User deleted: ${deletedUser.id}`);
    return deletedUser;
  } catch (err) {
    logger.error(`Error deleting user: ${err.message}`);
    throw new Error('Error deleting user');
  }
}

// Function to permanently delete user
async function permanentlyDeleteUser(id) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const deletedUser = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    logger.info(`User permanently deleted: ${deletedUser.id}`);
    return deletedUser;
  } catch (err) {
    logger.error(`Error permanently deleting user: ${err.message}`);
    throw new Error('Error permanently deleting user');
  }
}

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  permanentlyDeleteUser,
};