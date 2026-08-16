const rateLimit = require('express-rate-limit');

// Limitador global por IP para el endpoint de login (15 minutos, máximo 15 peticiones)
const loginIpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión desde esta conexión. Por favor intenta de nuevo en 15 minutos.'
  }
});

// Limitador por cuenta de usuario en memoria para intentos fallidos
const failedAttemptsByAccount = new Map(); // username -> { count, lockUntil }

const MAX_FAILED_ATTEMPTS_PER_ACCOUNT = 5;
const LOCK_TIME_MS = 10 * 60 * 1000; // 10 minutos de bloqueo

function checkAccountLockout(username) {
  const normalizedUser = (username || '').toLowerCase().trim();
  if (!normalizedUser) return { isLocked: false };

  const record = failedAttemptsByAccount.get(normalizedUser);
  if (!record) return { isLocked: false };

  const now = Date.now();
  if (record.lockUntil && record.lockUntil > now) {
    const remainingSeconds = Math.ceil((record.lockUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      message: `Esta cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${Math.ceil(remainingSeconds / 60)} minutos.`
    };
  }

  // Si expiró el bloqueo, resetear
  if (record.lockUntil && record.lockUntil <= now) {
    failedAttemptsByAccount.delete(normalizedUser);
  }

  return { isLocked: false };
}

function recordFailedLogin(username) {
  const normalizedUser = (username || '').toLowerCase().trim();
  if (!normalizedUser) return;

  const now = Date.now();
  const record = failedAttemptsByAccount.get(normalizedUser) || { count: 0, lockUntil: 0 };
  
  record.count += 1;
  if (record.count >= MAX_FAILED_ATTEMPTS_PER_ACCOUNT) {
    record.lockUntil = now + LOCK_TIME_MS;
    record.count = 0; // Se reinicia el contador de intentos al aplicar el bloqueo
  }
  
  failedAttemptsByAccount.set(normalizedUser, record);
}

function clearFailedLogin(username) {
  const normalizedUser = (username || '').toLowerCase().trim();
  if (normalizedUser) {
    failedAttemptsByAccount.delete(normalizedUser);
  }
}

module.exports = {
  loginIpLimiter,
  checkAccountLockout,
  recordFailedLogin,
  clearFailedLogin
};
