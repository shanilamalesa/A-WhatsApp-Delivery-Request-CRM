const express = require("express");
const rideRepo = require("../repositories/ride.repo");
const { authenticate } = require("../middleware/auth.middleware");
const router = express.Router();

// Protect all routes
router.use(authenticate);

// Dashboard loads the table (maps deliveries -> rides for frontend compatibility)
router.get('/deliveries', async (req, res) => {
  try {
    const rides = await rideRepo.getAllRides();
    res.json({
      total: rides.length,
      page: 1,
      pageSize: 20,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Operator clicks a delivery row
router.get('/deliveries/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ride = await rideRepo.getRideById(id);
    if (!ride) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Operator updates a delivery
router.patch('/deliveries/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const ride = await rideRepo.getRideById(id);
    if (!ride) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const updated = await rideRepo.updateRideStatus(id, status);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dashboard stats cards
router.get('/stats', async (req, res) => {
  try {
    const stats = await rideRepo.getRideStats();

    const statusMap = {
      new: 0, assigned: 0, in_progress: 0, completed: 0, cancelled: 0
    };
    stats.byStatus.forEach(row => { statusMap[row.status] = Number(row.count) });

    res.json({
      total: stats.total,
      today: stats.today,
      byStatus: statusMap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;