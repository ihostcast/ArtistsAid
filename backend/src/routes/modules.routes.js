const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const modulesController = require('../controllers/modules.controller');

// Rutas públicas
router.get('/', modulesController.listModules);
router.get('/:id', modulesController.getModuleDetails);

// Rutas protegidas
router.use(authenticateToken);
router.post('/:id/install', modulesController.installModule);
router.delete('/:id/uninstall', modulesController.uninstallModule);
router.put('/:id/config', modulesController.updateModuleConfig);
router.get('/user/installed', modulesController.getUserModules);

module.exports = router;
