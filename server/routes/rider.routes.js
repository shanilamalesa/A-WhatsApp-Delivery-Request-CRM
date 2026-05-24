const express = require('express');
const { listRiders, createRider, toggleRiderStatus } = require('../controllers/rider.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const router = express.Router();

router.use(authenticate);

router.get('/', listRiders);
router.post('/', requireRole('admin'), createRider);
router.patch('/:id/status', requireRole('admin'), toggleRiderStatus);

module.exports = router;