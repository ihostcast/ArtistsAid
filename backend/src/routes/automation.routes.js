const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const {
  getAllAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  getAutomationLogs,
  runAutomation,
  getAutomationStats
} = require('../controllers/automation.controller');

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticateToken, isAdmin);

// Rutas para automatizaciones
router.get('/', getAllAutomations);
router.post('/', createAutomation);
router.get('/:id', getAutomation);
router.put('/:id', updateAutomation);
router.delete('/:id', deleteAutomation);

// Rutas para logs y estadísticas
router.get('/:id/logs', getAutomationLogs);
router.get('/:id/stats', getAutomationStats);
router.post('/:id/run', runAutomation);

module.exports = router;
