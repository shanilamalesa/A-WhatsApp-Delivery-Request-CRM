const pool = require('../config/db');

async function getAllRiders() {
  const result = await pool.query(`
    SELECT * FROM riders ORDER BY created_at DESC
  `);
  return result.rows;
}

async function getRiderByPhone(phone) {
  const result = await pool.query(`
    SELECT * FROM riders WHERE phone = $1
  `, [phone]);
  return result.rows[0];
}

async function createRider({ name, phone }) {
  const result = await pool.query(`
    INSERT INTO riders (name, phone, status)
    VALUES ($1, $2, 'offline')
    RETURNING *
  `, [name, phone]);
  return result.rows[0];
}

async function updateRiderStatus(id, status) {
  const result = await pool.query(`
    UPDATE riders SET status = $1 WHERE id = $2 RETURNING *
  `, [status, id]);
  return result.rows[0];
}

async function findAvailableRider(client) {
  const result = await client.query(`
    SELECT * FROM riders
    WHERE id = (
      SELECT r.id
      FROM riders r
      LEFT JOIN rides ride
        ON ride.rider_id = r.id
        AND ride.status IN ('assigned', 'in_progress')
      WHERE r.status = 'online'
      GROUP BY r.id
      ORDER BY COUNT(ride.id) ASC, MAX(ride.assigned_at) ASC NULLS FIRST
      LIMIT 1
    )
    FOR UPDATE
  `);
  return result.rows[0];
}
module.exports = { getAllRiders, getRiderByPhone, createRider, updateRiderStatus, findAvailableRider };