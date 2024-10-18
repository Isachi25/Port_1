const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Route to create a new admin
router.post('/', adminController.createAdmin);

// Route to get all admins with pagination
router.get('/', adminController.getAdmins);

// Route to get an admin by ID
router.get('/:id', adminController.getAdminById);

// Route to update an admin
router.put('/:id', adminController.updateAdmin);

// Route to soft delete an admin
router.delete('/:id', adminController.deleteAdmin);

// Route to permanently delete an admin
router.delete('/:id/permanent', adminController.permanentlyDeleteAdmin);

module.exports = router;