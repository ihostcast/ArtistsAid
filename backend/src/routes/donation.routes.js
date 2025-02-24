const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// Rutas protegidas
router.post('/', authenticate, donationController.createDonation);
router.get('/', authenticate, donationController.getDonations);
router.get('/:id', authenticate, donationController.getDonation);
router.put('/:id', authenticate, authorize(['admin', 'financial']), donationController.updateDonation);
router.delete('/:id', authenticate, authorize(['admin']), donationController.deleteDonation);

module.exports = router;
