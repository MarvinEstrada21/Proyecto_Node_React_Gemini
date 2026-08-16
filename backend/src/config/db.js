const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Probar conexión inicial
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Conectado exitosamente a la base de datos MySQL '${config.db.name}' en ${config.db.host}:${config.db.port}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB ERROR] Error al conectar con MySQL:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
