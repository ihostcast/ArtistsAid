const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Rutas protegidas
router.post('/', authenticate, receiptController.createReceipt);
router.get('/', authenticate, receiptController.getReceipts);
router.get('/:id', authenticate, receiptController.getReceipt);
router.put('/:id', authenticate, authorize(['admin', 'verifier']), receiptController.updateReceipt);
router.delete('/:id', authenticate, authorize(['admin']), receiptController.deleteReceipt);

module.exports = router;
