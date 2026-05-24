const pool = require('../config/db');

async function getConversation(customer_id) {
  const result = await pool.query(
    'SELECT * FROM conversations WHERE customer_id = $1', [customer_id]
  );
  return result.rows[0];
}

async function upsertConversation(customer_id, state, data) {
  const result = await pool.query(`
    INSERT INTO conversations (customer_id, state, data)
    VALUES ($1, $2, $3)
    ON CONFLICT (customer_id)
    DO UPDATE SET state = $2, data = $3, updated_at = NOW()
    RETURNING *
  `, [customer_id, state, data]);
  return result.rows[0];
}

module.exports = { getConversation, upsertConversation };