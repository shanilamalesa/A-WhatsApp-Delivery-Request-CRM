const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'boda_dispatch',
  user: process.env.DB_USER || 'boda_user',
  password: process.env.DB_PASSWORD || 'boda1234',
});

module.exports = pool;