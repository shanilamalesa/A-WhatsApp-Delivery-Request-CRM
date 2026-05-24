const riderRepo = require('../repositories/rider.repo');

async function listRiders(req, res) {
  try {
    const riders = await riderRepo.getAllRiders();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createRider(req, res) {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    const rider = await riderRepo.createRider({ name, phone });
    res.status(201).json(rider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function toggleRiderStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Status must be online or offline' });
    }
    const rider = await riderRepo.updateRiderStatus(Number(req.params.id), status);
    if (!rider) return res.status(404).json({ error: 'Rider not found' });
    res.json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { listRiders, createRider, toggleRiderStatus };