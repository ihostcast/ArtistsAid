const express = require('express');
const router = express.Router();
const causeController = require('../controllers/cause.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', causeController.getAllCauses);
router.get('/:id', causeController.getCauseById);

// Rutas protegidas
router.use(authenticateToken);
router.post('/', causeController.createCause);
router.put('/:id', causeController.updateCause);
router.delete('/:id', causeController.deleteCause);

// Rutas específicas de la causa
router.get('/:id/donations', causeController.getCauseDonations);
router.post('/:id/evidence', causeController.addCauseEvidence);
router.get('/:id/evidence', causeController.getCauseEvidence);

// Rutas de administración
router.use(isAdmin);
router.put('/:id/approve', causeController.approveCause);
router.put('/:id/reject', causeController.rejectCause);
router.put('/:id/verify', causeController.verifyCause);

module.exports = router;
