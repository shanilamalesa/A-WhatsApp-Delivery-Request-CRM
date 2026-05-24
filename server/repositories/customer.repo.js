const pool = require('../config/db');

async function findByPhone(phone) {
  const result = await pool.query(
    'SELECT * FROM customers WHERE phone = $1', [phone]
  );
  return result.rows[0];
}

async function createCustomer(phone, name) {
  const result = await pool.query(
    'INSERT INTO customers (phone, name) VALUES ($1, $2) RETURNING *',
    [phone, name]
  );
  return result.rows[0];
}

module.exports = { findByPhone, createCustomer };