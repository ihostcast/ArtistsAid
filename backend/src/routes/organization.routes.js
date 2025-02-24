const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganizationById);

// Rutas protegidas
router.use(authenticateToken);
router.post('/', organizationController.createOrganization);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

// Rutas específicas de la organización
router.get('/:id/causes', organizationController.getOrganizationCauses);
router.get('/:id/members', organizationController.getOrganizationMembers);
router.post('/:id/members', organizationController.addOrganizationMember);
router.delete('/:id/members/:userId', organizationController.removeOrganizationMember);

// Rutas de administración
router.use(isAdmin);
router.put('/:id/status', organizationController.updateOrganizationStatus);
router.get('/:id/transactions', organizationController.getOrganizationTransactions);

module.exports = router;
