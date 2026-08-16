const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { pool } = require('../config/db');

// Middleware para verificar autenticación mediante JWT
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado. Se requiere iniciar sesión.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Obtener siempre el rol y datos actualizados directamente de la base de datos (Regla de Seguridad #7)
    const [rows] = await pool.query(
      'SELECT username, nameUser, lastnameUser, imageUser, roleUser FROM tb_users WHERE username = ? LIMIT 1',
      [decoded.username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Sesión inválida o el usuario ya no existe.'
      });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado. Por favor inicia sesión nuevamente.'
    });
  }
}

// Middleware para autenticación opcional (para endpoints públicos que personalizan respuesta si hay login)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7).trim() 
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const [rows] = await pool.query(
      'SELECT username, nameUser, lastnameUser, imageUser, roleUser FROM tb_users WHERE username = ? LIMIT 1',
      [decoded.username]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

// Middleware para exigir rol de administrador
function requireAdmin(req, res, next) {
  if (!req.user || req.user.roleUser !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren privilegios de administrador.'
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};
