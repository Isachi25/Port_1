const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');
const logger = require('../utils/logger');

// Validation schema
const adminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  profileImage: Joi.string().required(),
});

// Function to create a new admin
async function createAdmin(admin) {
  const { error } = adminSchema.validate(admin);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  try {
    const newAdmin = await prisma.admin.create({
      data: admin,
    });
    logger.info(`Admin created: ${newAdmin.id}`);
    return newAdmin;
  } catch (err) {
    logger.error(`Error creating admin: ${err.message}`);
    throw new Error('Error creating admin');
  }
}

// Function to get all admins with pagination
async function getAdmins(page = 1, limit = 10) {
  try {
    const admins = await prisma.admin.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        deletedAt: null,
      },
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
    const admin = await prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!admin || admin.deletedAt) {
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
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin || existingAdmin.deletedAt) {
      throw new Error('Admin not found');
    }

    const updatedAdmin = await prisma.admin.update({
      where: {
        id: id,
      },
      data: admin,
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
    const deletedAdmin = await prisma.admin.update({
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
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingAdmin) {
      throw new Error('Admin not found');
    }

    const deletedAdmin = await prisma.admin.delete({
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
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  permanentlyDeleteAdmin,
};