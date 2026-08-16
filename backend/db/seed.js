const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function seed() {
  console.log('[SEED] Verificando usuarios iniciales...');
  const saltRounds = 12;
  const adminPassword = await bcrypt.hash('Admin123*', saltRounds);
  const userPassword = await bcrypt.hash('User123*', saltRounds);

  try {
    // Insertar administrador por defecto si no existe
    await pool.query(
      `INSERT INTO tb_users (username, nameUser, lastnameUser, passwordUser, roleUser, createdIn)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE nameUser=VALUES(nameUser)`,
      ['admin', 'Administrador', 'Principal', adminPassword, 'admin']
    );

    // Insertar usuario de prueba si no existe
    await pool.query(
      `INSERT INTO tb_users (username, nameUser, lastnameUser, passwordUser, roleUser, createdIn)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE nameUser=VALUES(nameUser)`,
      ['chef_demo', 'Chef', 'Demo', userPassword, 'user']
    );

    console.log('[SEED] Usuarios listos.');
    console.log(' - Admin: user: admin / pass: Admin123*');
    console.log(' - Demo:  user: chef_demo / pass: User123*');
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
