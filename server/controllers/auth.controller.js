const { login, register } = require('../services/auth.service');

async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await login(email, password);
    res.json(result);

  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

async function registerHandler(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    if (!['admin', 'dispatcher'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or dispatcher' });
    }

    const user = await register(email, password, role);
    res.status(201).json(user);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { loginHandler, registerHandler };