/**
 * Utilidades de validación y formateo de datos
 */

// Elimina espacios en blanco al inicio y al final de strings
function sanitizeString(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  return String(val).trim();
}

// Limpia recursivamente todas las propiedades string de un objeto
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Verifica si un valor de texto no está vacío tras trim
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

// Quita passwordUser de objetos de usuario para proteger la seguridad
function safeUser(user) {
  if (!user) return null;
  const { passwordUser, ...safe } = user;
  return safe;
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  isNonEmptyString,
  safeUser
};
