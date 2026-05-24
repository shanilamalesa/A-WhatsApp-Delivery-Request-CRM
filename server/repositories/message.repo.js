const pool = require('../config/db');

async function logMessage(customer_id, direction, content) {
  const result = await pool.query(
    'INSERT INTO messages (customer_id, direction, content) VALUES ($1, $2, $3) RETURNING *',
    [customer_id, direction, content]
  );
  return result.rows[0];
}

module.exports = { logMessage };