const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findUserByEmail, createUser } = require('../repositories/user.repo');

async function login(email, password) {
  // 1. Find the user
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Check the password
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  // 3. Create a JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

async function register(email, password, role) {
  // 1. Check if user already exists
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email already in use');
  }

  // 2. Hash the password
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  const password_hash = await bcrypt.hash(password, rounds);

  // 3. Save to database
  const user = await createUser({ email, password_hash, role });
  return user;
}

module.exports = { login, register };