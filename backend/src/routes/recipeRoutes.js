const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

// Obtener todas las categorías
router.get('/categories', recipeController.getCategories);

// Listar recetas con búsqueda y filtros
router.get('/', optionalAuth, recipeController.getRecipes);

// Obtener detalle de receta por ID
router.get('/:id', optionalAuth, recipeController.getRecipeById);

// Crear nueva receta (requiere autenticación, opcional imagen 'imageRecipe')
router.post('/', authenticateToken, handleUpload('imageRecipe'), recipeController.createRecipe);

// Editar receta (requiere autenticación, valida autor o admin en el servidor)
router.put('/:id', authenticateToken, handleUpload('imageRecipe'), recipeController.updateRecipe);

// Eliminar receta (requiere autenticación, valida autor o admin en el servidor)
router.delete('/:id', authenticateToken, recipeController.deleteRecipe);

module.exports = router;
