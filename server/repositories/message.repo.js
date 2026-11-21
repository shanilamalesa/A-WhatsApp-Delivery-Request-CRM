const pool = require('../config/db');

async function logMessage(customer_id, direction, content) {
  const result = await pool.query(
    'INSERT INTO messages (customer_id, direction, content) VALUES ($1, $2, $3) RETURNING *',
    [customer_id, direction, content]
  );
  return result.rows[0];
}

async function getMessagesByCustomer(customer_id) {
  const result = await pool.query(
    'SELECT * FROM messages WHERE customer_id = $1 ORDER BY created_at ASC, id ASC',
    [customer_id]
  );
  return result.rows;
}

module.exports = { logMessage, getMessagesByCustomer };