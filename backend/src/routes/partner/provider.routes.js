const express = require('express');
const router = express.Router();
const { authenticateToken, isPartner } = require('../../middleware/auth');
const providerController = require('../../controllers/partner/provider.controller');

// Middleware para verificar que el usuario es un partner
router.use(authenticateToken, isPartner);

// Rutas de providers
router.post('/', providerController.createProvider);
router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);
router.post('/:id/services', providerController.assignServices);
router.patch('/:id/status', providerController.updateStatus);

module.exports = router;
