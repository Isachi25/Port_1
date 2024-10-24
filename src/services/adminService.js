const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');
const { hashPassword, verifyPassword } = require('../utils/hashPassword');

// Validation schema
const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  profileImage: Joi.string().required(),
  role: Joi.string().valid('admin').default('admin')
});

// Validation schema for login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Function to create a new admin
async function createAdmin(admin) {
  const { error } = adminSchema.validate(admin);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Extract individual fields
    const { name, email, password, profileImage, role } = admin;

    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profileImage,
        role
      },
    });
    logger.info(`Admin created: ${newAdmin.id}`);
    return newAdmin;
  } catch (err) {
    logger.error(`Error creating admin: ${err.message}`);
    throw new Error('Error creating admin');
  }
}

async function loginAdmin(email, password) {
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const admin = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!admin || admin.deletedAt || admin.role !== 'admin') {
      throw new Error('Invalid email or password');
    }

    const passwordMatch = await verifyPassword(password, admin.password);
    if (!passwordMatch) {
      throw new Error('Invalid email or password');
    }

    logger.info(`Admin logged in: ${admin.id}`);
    return admin;
  } catch (err) {
    logger.error(`Error logging in admin: ${err.message}`);
    throw new Error('Error logging in admin');
  }
}

// Function to get all admins with pagination
async function getAdmins(page = 1, limit = 10) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    logger.info(`Fetched ${admins.length} admins`);
    return admins;
  } catch (err) {
    logger.error(`Error fetching admins: ${err.message}`);
    throw new Error('Error fetching admins');
  }
}

// Function to get admin by ID
async function getAdminById(id) {
  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!admin || admin.deletedAt || admin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    logger.info(`Fetched admin: ${admin.id}`);
    return admin;
  } catch (err) {
    logger.error(`Error fetching admin: ${err.message}`);
    throw new Error('Error fetching admin');
  }
}

// Function to update admin
async function updateAdmin(id, admin) {
  const { error } = adminSchema.validate(admin);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin || existingAdmin.deletedAt || existingAdmin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    // Extract individual fields
    const { name, email, password, profileImage, role } = admin;

    const updatedAdmin = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        name,
        email,
        password,
        profileImage,
        role
      },
    });
    logger.info(`Admin updated: ${updatedAdmin.id}`);
    return updatedAdmin;
  } catch (err) {
    logger.error(`Error updating admin: ${err.message}`);
    throw new Error('Error updating admin');
  }
}

// Function to delete admin (soft delete)
async function deleteAdmin(id) {
  try {
    const deletedAdmin = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    logger.info(`Admin deleted: ${deletedAdmin.id}`);
    return deletedAdmin;
  } catch (err) {
    logger.error(`Error deleting admin: ${err.message}`);
    throw new Error('Error deleting admin');
  }
}

// Function to permanently delete admin
async function permanentlyDeleteAdmin(id) {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin || existingAdmin.role !== 'admin') {
      throw new Error('Admin not found');
    }

    const deletedAdmin = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    logger.info(`Admin permanently deleted: ${deletedAdmin.id}`);
    return deletedAdmin;
  } catch (err) {
    logger.error(`Error permanently deleting admin: ${err.message}`);
    throw new Error('Error permanently deleting admin');
  }
}

module.exports = {
  createAdmin,
  loginAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  permanentlyDeleteAdmin,
};