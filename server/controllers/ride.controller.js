const rideService = require('../services/ride.service');

async function listRides(req, res) {
  try {
    const rides = await rideService.getRides(req.user);
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRide(req, res) {
  try {
    const ride = await rideService.getRideById(Number(req.params.id));
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function claimRide(req, res) {
  try {
    const ride = await rideService.claimRide(
      Number(req.params.id),
      req.user.id
    );
    res.json(ride);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const ride = await rideService.changeStatus(
      Number(req.params.id),
      status,
      req.user
    );
    res.json(ride);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

module.exports = { listRides, getRide, claimRide, updateStatus };