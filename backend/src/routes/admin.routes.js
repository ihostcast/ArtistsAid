const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Proteger todas las rutas de administración
router.use(authenticateToken, isAdmin);

// Ruta de resumen
router.get('/overview', adminController.getOverview);

// Rutas de usuarios
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Rutas de organizaciones
router.get('/organizations', adminController.getAllOrganizations);

// Rutas de causas
router.get('/causes', adminController.getAllCauses);

// Rutas de transacciones
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
