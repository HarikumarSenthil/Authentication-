const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { logger } = require('../utils/helpers');
const { recordAudit } = require('../utils/auditHelper');

const generateToken = ({ user_id, username }) => {
  return jwt.sign({ user_id, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, full_name } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({ username, email, password, full_name });
    const token = generateToken(user);

    await recordAudit(req, 'User Registered', { user });

    res.status(201).json({ message: 'User registered', token, user });
  } catch (err) {
    logger.error('Registration failed', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await User.validatePassword(password, user.password_hash);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    await recordAudit(req, 'User Logged In', { user_id: user.user_id });

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    logger.error('Login failed', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };
