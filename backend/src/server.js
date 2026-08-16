const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { testConnection } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Rutas
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Configuración de CORS estricto (Regla de Seguridad #14)
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (como herramientas internas o curl) o que coincidan con FRONTEND_ORIGIN
    if (!origin || origin === config.frontendOrigin || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
      callback(null, true);
    } else {
      callback(new Error(`CORS no permitido para el origen: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Parsing de cuerpos JSON y URL-encoded con límites seguros
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos subidos de forma segura
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), {
  dotfiles: 'ignore',
  etag: true,
  maxAge: '1d'
}));

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// Manejo de rutas 404
app.use(notFoundHandler);

// Manejo global de errores centralizado
app.use(errorHandler);

// Iniciar el servidor
async function startServer() {
  await testConnection();

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(` [SERVIDOR INICIADO] Recetario Backend API`);
    console.log(` URL: http://localhost:${config.port}`);
    console.log(` CORS permitido para: ${config.frontendOrigin}`);
    console.log(` Modo: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
