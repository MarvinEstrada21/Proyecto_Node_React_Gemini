const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env en la raíz de backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'recetario_db'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_recetario_development_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};

module.exports = config;
