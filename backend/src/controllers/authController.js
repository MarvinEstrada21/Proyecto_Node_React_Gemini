const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const config = require('../config/env');
const { safeUser } = require('../utils/helpers');
const {
  validateRegisterInput,
  validateLoginInput,
  validateProfileUpdate
} = require('../middleware/validator');
const {
  checkAccountLockout,
  recordFailedLogin,
  clearFailedLogin
} = require('../middleware/rateLimiter');

// Registro de usuario nuevo
async function register(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateRegisterInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor corrige los errores en el formulario de registro.',
        errors
      });
    }

    const { username, nameUser, lastnameUser, passwordUser } = sanitized;

    // Verificar si el username ya está registrado
    const [existing] = await pool.query(
      'SELECT username FROM tb_users WHERE username = ? LIMIT 1',
      [username]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El nombre de usuario ya se encuentra registrado. Por favor elige otro.',
        errors: {
          username: 'Este nombre de usuario ya está en uso.'
        }
      });
    }

    // Hashear contraseña con bcrypt (salt lento)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(passwordUser, saltRounds);

    // Manejo de imagen de perfil opcional
    let imageUser = null;
    if (req.file) {
      imageUser = `/uploads/${req.file.filename}`;
    }

    // Rol por defecto: 'user'
    const roleUser = 'user';

    // Insertar usuario
    await pool.query(
      'INSERT INTO tb_users (username, nameUser, lastnameUser, passwordUser, imageUser, roleUser, createdIn) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [username, nameUser, lastnameUser, hashedPassword, imageUser, roleUser]
    );

    // Obtener usuario creado sin campos sensibles
    const [newUserRows] = await pool.query(
      'SELECT username, nameUser, lastnameUser, imageUser, roleUser, createdIn FROM tb_users WHERE username = ?',
      [username]
    );

    const user = newUserRows[0];

    // Generar token JWT
    const token = jwt.sign(
      { username: user.username, roleUser: user.roleUser },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente.',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
}

// Inicio de sesión
async function login(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor proporciona tu usuario y contraseña.',
        errors
      });
    }

    const { username, passwordUser } = sanitized;

    // Verificar si la cuenta está bloqueada temporalmente por intentos fallidos
    const lockout = checkAccountLockout(username);
    if (lockout.isLocked) {
      return res.status(429).json({
        success: false,
        message: lockout.message
      });
    }

    // Buscar usuario en base de datos
    const [users] = await pool.query(
      'SELECT username, nameUser, lastnameUser, passwordUser, imageUser, roleUser, createdIn FROM tb_users WHERE username = ? LIMIT 1',
      [username]
    );

    // Verificación de credenciales genérica (no revela si el usuario existe o la clave está mal)
    if (users.length === 0) {
      recordFailedLogin(username);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifica tu usuario y contraseña.'
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(passwordUser, user.passwordUser);

    if (!passwordMatch) {
      recordFailedLogin(username);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifica tu usuario y contraseña.'
      });
    }

    // Login exitoso: limpiar registro de intentos fallidos
    clearFailedLogin(username);

    // Generar token JWT con rol seguro del servidor
    const token = jwt.sign(
      { username: user.username, roleUser: user.roleUser },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return res.json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      user: safeUser(user),
      token
    });
  } catch (error) {
    next(error);
  }
}

// Obtener perfil del usuario autenticado
async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT username, nameUser, lastnameUser, imageUser, roleUser, createdIn FROM tb_users WHERE username = ?',
      [req.user.username]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      success: true,
      user: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// Actualizar perfil de usuario
async function updateProfile(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateProfileUpdate(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Por favor corrige los errores del formulario.',
        errors
      });
    }

    const { nameUser, lastnameUser } = sanitized;
    let imageUser = req.user.imageUser;

    if (req.file) {
      imageUser = `/uploads/${req.file.filename}`;
    }

    await pool.query(
      'UPDATE tb_users SET nameUser = ?, lastnameUser = ?, imageUser = ? WHERE username = ?',
      [nameUser, lastnameUser, imageUser, req.user.username]
    );

    const [updatedRows] = await pool.query(
      'SELECT username, nameUser, lastnameUser, imageUser, roleUser, createdIn FROM tb_users WHERE username = ?',
      [req.user.username]
    );

    return res.json({
      success: true,
      message: 'Perfil actualizado exitosamente.',
      user: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
