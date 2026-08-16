const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginIpLimiter } = require('../middleware/rateLimiter');
const { handleUpload } = require('../middleware/upload');

// Registro de usuario (con subida opcional de imagen de perfil 'imageUser')
router.post('/register', handleUpload('imageUser'), authController.register);

// Inicio de sesión (con rate limiter estricto por IP y cuenta)
router.post('/login', loginIpLimiter, authController.login);

// Obtener perfil autenticado
router.get('/profile', authenticateToken, authController.getProfile);

// Actualizar perfil autenticado (con subida opcional de imagen 'imageUser')
router.put('/profile', authenticateToken, handleUpload('imageUser'), authController.updateProfile);

module.exports = router;
