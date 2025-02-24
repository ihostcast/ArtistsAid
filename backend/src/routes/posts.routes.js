const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const { authenticate } = require('../middleware/auth');

// Rutas públicas
router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

// Rutas protegidas
router.post('/', authenticate, postsController.createPost);
router.put('/:id', authenticate, postsController.updatePost);
router.delete('/:id', authenticate, postsController.deletePost);
router.post('/:id/like', authenticate, postsController.toggleLike);

module.exports = router;
