const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de transacciones
router.post('/', transactionController.create);
router.get('/', transactionController.list);
router.get('/:id', transactionController.getOne);
router.put('/:id/status', transactionController.updateStatus);

module.exports = router;
