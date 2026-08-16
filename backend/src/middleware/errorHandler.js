const config = require('../config/env');

/**
 * Middleware centralizado de manejo de errores.
 * Garantiza que nunca se envíen stacktraces, consultas SQL ni rutas internas al cliente.
 */
function errorHandler(err, req, res, next) {
  // Registro seguro en consola del servidor (para debugging interno del desarrollador)
  console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl}:`, err.message || err);
  if (config.nodeEnv === 'development' && err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  
  // Mensaje genérico y seguro para el cliente
  let clientMessage = 'Ha ocurrido un error interno en el servidor. Por favor intente más tarde.';
  
  if (statusCode < 500 && err.message) {
    clientMessage = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    errors: err.errors || null
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
