const express = require('express');
const adminController = require('../controllers/adminController');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

const router = express.Router();

// Route to create a new admin
router.post('/', adminController.createAdmin);

// Route to login an admin
router.post('/login', adminController.loginAdmin);

// Route to get all admins with pagination
router.get('/', adminMiddleware, adminController.getAdmins);

// Route to get an admin by ID
router.get('/:id', adminMiddleware, adminController.getAdminById);

// Route to update an admin
router.put('/:id', adminMiddleware, adminController.updateAdmin);

// Route to soft delete an admin
router.delete('/:id', adminMiddleware, adminController.deleteAdmin);

// Route to permanently delete an admin
router.delete('/:id/permanent', adminMiddleware, adminController.permanentlyDeleteAdmin);

module.exports = router;