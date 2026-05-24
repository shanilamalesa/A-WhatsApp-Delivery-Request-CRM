const express = require('express');
const { loginHandler, registerHandler } = require('../controllers/auth.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/login', loginHandler);

// Only admins can create new users
router.post('/register', authenticate, requireRole('admin'), registerHandler);

module.exports = router;