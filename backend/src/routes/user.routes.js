const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/:id/public', userController.getPublicProfile);

// Rutas protegidas
router.use(authenticateToken);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateUser);

// Rutas de administración
router.use(isAdmin);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);
router.put('/:id/role', userController.updateRole);

module.exports = router;
