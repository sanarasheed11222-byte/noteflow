const fs = require('fs');

fs.writeFileSync('./config/db.js',
`const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'tramway.proxy.rlwy.net',
  port: 49235,
  user: 'root',
  password: 'LKtljpPptqbKAmYrGvxDNdhjCWQDPKlS',
  database: 'railway',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;`
);

console.log('Done!');