const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await pool.getConnection();
      console.log('✅ MySQL connected successfully');
      conn.release();
      return;
    } catch (err) {
      console.log(`⚠️ MySQL connection failed. Retry ${i + 1}/${retries}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.error('❌ MySQL connection failed after retries. Exiting.');
  process.exit(1);
}

testConnection();

module.exports = pool;
