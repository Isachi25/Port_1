const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Route to create a new user (admin or retailer)
router.post('/', authController.createUser);

// Route to login a user (admin or retailer)
router.post('/login', authController.loginUser);

// Route to get all users with pagination (admin or retailer)
router.get('/', authMiddleware, adminMiddleware, authController.getUsers);

// Route to get a user by ID (admin or retailer)
router.get('/:id', authMiddleware, authController.getUserById);

// Route to update a user (admin or retailer)
router.put('/:id', authMiddleware, authController.updateUser);

// Route to soft delete a user (admin or retailer)
router.delete('/:id', authMiddleware, adminMiddleware, authController.deleteUser);

// Route to permanently delete a user (admin or retailer)
router.delete('/:id/permanent', authMiddleware, adminMiddleware, authController.permanentlyDeleteUser);

module.exports = router;