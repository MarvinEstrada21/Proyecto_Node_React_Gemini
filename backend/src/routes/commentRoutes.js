const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// Obtener comentarios de una receta específica
router.get('/recipe/:recipeId', commentController.getCommentsByRecipe);

// Crear comentario en una receta (requiere autenticación)
router.post('/recipe/:recipeId', authenticateToken, commentController.createComment);

// Eliminar comentario (requiere autenticación, autor o admin verificado en servidor)
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
