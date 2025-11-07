require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const connection = await mysql.createConnection({
      host: 'srv1991.hstgr.io',
      port: 3306,
      user: 'u788338702_ecommerce',
      password: 'Ecommerce@54321',
      database: 'u788338702_ecommerce'
    });
    
    console.log('✅ Successfully connected to the database!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
