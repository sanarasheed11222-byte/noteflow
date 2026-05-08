const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'tramway.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT) || 49235,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'LKtljpPptqbKAmYrGvxDNdhjCWQDPKlS',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;