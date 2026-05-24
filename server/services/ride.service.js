const pool = require('../config/db');
const rideRepo = require('../repositories/ride.repo');
const riderRepo = require('../repositories/rider.repo');

const VALID_TRANSITIONS = {
  new: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

async function getRides(user) {
  if (user.role === 'admin') {
    return rideRepo.getAllRides();
  }
  return rideRepo.getRidesByDispatcher(user.id);
}

async function changeStatus(rideId, newStatus, user) {
  const ride = await rideRepo.getRideById(rideId);

  if (!ride) {
    throw new Error('Ride not found');
  }

  const allowed = VALID_TRANSITIONS[ride.status];
  if (!allowed.includes(newStatus)) {
    const err = new Error(`Cannot move from ${ride.status} to ${newStatus}`);
    err.status = 409;
    throw err;
  }

  return rideRepo.updateRideStatus(rideId, newStatus);
}

async function claimRide(rideId, dispatcherId) {
  // Get a single client from the pool for the transaction
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Find the best available rider (locks the row)
    const rider = await riderRepo.findAvailableRider(client);

    if (!rider) {
      await client.query('ROLLBACK');
      const err = new Error('No riders are online. Cannot claim ride.');
      err.status = 400;
      throw err;
    }

    // 2. Assign the ride
    const result = await client.query(`
      UPDATE rides 
      SET status = 'assigned',
          rider_id = $1,
          dispatcher_id = $2,
          assigned_at = NOW(),
          updated_at = NOW()
      WHERE id = $3 AND status = 'new'
      RETURNING *
    `, [rider.id, dispatcherId, rideId]);

    // If another dispatcher already claimed it
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      const err = new Error('Ride already claimed by another dispatcher');
      err.status = 409;
      throw err;
    }

    await client.query('COMMIT');
    return result.rows[0];

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

module.exports = { getRides, changeStatus, claimRide };