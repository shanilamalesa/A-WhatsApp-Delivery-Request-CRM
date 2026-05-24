const pool = require('../config/db');

async function getAllRides() {
  const result = await pool.query(`
    SELECT rides.*, 
           customers.name AS customer_name, 
           customers.phone AS customer_phone,
           riders.name AS rider_name,
           users.email AS dispatcher_email
    FROM rides
    LEFT JOIN customers ON rides.customer_id = customers.id
    LEFT JOIN riders ON rides.rider_id = riders.id
    LEFT JOIN users ON rides.dispatcher_id = users.id
    ORDER BY rides.created_at DESC
  `);
  return result.rows;
}

async function getRideById(id) {
  const result = await pool.query(`
    SELECT rides.*, 
           customers.name AS customer_name,
           customers.phone AS customer_phone,
           riders.name AS rider_name,
           riders.phone AS rider_phone,
           users.email AS dispatcher_email
    FROM rides
    LEFT JOIN customers ON rides.customer_id = customers.id
    LEFT JOIN riders ON rides.rider_id = riders.id
    LEFT JOIN users ON rides.dispatcher_id = users.id
    WHERE rides.id = $1
  `, [id]);
  return result.rows[0];
}

async function getRidesByDispatcher(dispatcher_id) {
  const result = await pool.query(`
    SELECT rides.*,
           customers.name AS customer_name,
           customers.phone AS customer_phone,
           riders.name AS rider_name
    FROM rides
    LEFT JOIN customers ON rides.customer_id = customers.id
    LEFT JOIN riders ON rides.rider_id = riders.id
    WHERE rides.dispatcher_id = $1
       OR rides.status = 'new'
    ORDER BY rides.created_at DESC
  `, [dispatcher_id]);
  return result.rows;
}

async function createRide({ customer_id, pickup_location, dropoff_location }) {
  const result = await pool.query(`
    INSERT INTO rides (customer_id, pickup_location, dropoff_location, status)
    VALUES ($1, $2, $3, 'new')
    RETURNING *
  `, [customer_id, pickup_location, dropoff_location]);
  return result.rows[0];
}

async function updateRideStatus(id, status) {
  const result = await pool.query(`
    UPDATE rides SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [status, id]);
  return result.rows[0];
}

async function getRiderActiveRide(rider_id) {
  const result = await pool.query(`
    SELECT rides.*, customers.phone AS customer_phone
    FROM rides
    LEFT JOIN customers ON rides.customer_id = customers.id
    WHERE rides.rider_id = $1 AND rides.status = 'in_progress'
    LIMIT 1
  `, [rider_id]);
  return result.rows[0];
}

async function getRideStats() {
  const total = await pool.query('SELECT COUNT(*) as count FROM rides');
  
  const today = await pool.query(`
    SELECT COUNT(*) as count FROM rides
    WHERE DATE(created_at) = CURRENT_DATE
  `);

  const byStatus = await pool.query(`
    SELECT status, COUNT(*) as count FROM rides GROUP BY status
  `);

  return {
    total: Number(total.rows[0].count),
    today: Number(today.rows[0].count),
    byStatus: byStatus.rows
  };
}

module.exports = { getAllRides, getRideById, getRidesByDispatcher, createRide, updateRideStatus, getRiderActiveRide, getRideStats };