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

// Lista de orígenes configurados en variables de entorno (soporta múltiples separados por coma)
const configuredOrigins = config.frontendOrigin
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Regex para permitir orígenes de desarrollo local y redes privadas/VMs (localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const localNetworkOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

// Configuración de CORS segura y flexible para entorno local y máquinas virtuales (VM Kali / VirtualBox)
const corsOptions = {
  origin: function (origin, callback) {
    // 1. Permitir peticiones sin origin (herramientas como curl, Postman, scripts de Kali)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Permitir si coincide con alguno de los orígenes configurados en .env
    if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    // 3. Permitir si proviene de la máquina host o una red virtual local (ej. VM Kali)
    if (localNetworkOriginRegex.test(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS no permitido para el origen: ${origin}`));
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
    host: config.host,
    port: config.port,
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

// Iniciar el servidor vinculando a HOST y PORT
async function startServer() {
  await testConnection();

  const server = app.listen(config.port, config.host, () => {
    console.log(`=======================================================`);
    console.log(` [SERVIDOR INICIADO] Recetario Backend API`);
    console.log(` Host: ${config.host} (Escuchando en todas las interfaces)`);
    console.log(` Puerto: ${config.port}`);
    console.log(` Acceso Local Host:  http://localhost:${config.port}`);
    console.log(` Acceso Red / VM:    http://<TU_IP_HOST>:${config.port}`);
    console.log(` Modo: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
