const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);

// Rutas protegidas
router.post('/', authenticate, newsController.createNews);
router.put('/:id', authenticate, newsController.updateNews);
router.delete('/:id', authenticate, newsController.deleteNews);
router.post('/:id/like', authenticate, newsController.toggleLike);

module.exports = router;
