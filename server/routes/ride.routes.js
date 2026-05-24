const express = require('express');
const { listRides, getRide, claimRide, updateStatus } = require('../controllers/ride.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const router = express.Router();

// All ride routes require login
router.use(authenticate);

router.get('/', listRides);
router.get('/:id', getRide);
router.post('/:id/claim', requireRole('admin', 'dispatcher'), claimRide);
router.patch('/:id/status', requireRole('admin', 'dispatcher'), updateStatus);

module.exports = router;