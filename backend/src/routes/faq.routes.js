const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq.controller');
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.get('/', faqController.getAllFAQs);

// Rutas protegidas (solo admin)
router.post('/', authenticate, faqController.createFAQ);
router.put('/:id', authenticate, faqController.updateFAQ);
router.delete('/:id', authenticate, faqController.deleteFAQ);
router.post('/reorder', authenticate, faqController.reorderFAQs);

module.exports = router;
