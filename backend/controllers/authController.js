const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
    const { name, email, password } = req.body;
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ status: 'error', message: 'User already exists' });
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    const userId = result.insertId;
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    res.status(201).json({ status: 'success', message: 'Account created successfully', data: { id: userId, name, email, accessToken, refreshToken } });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    res.status(200).json({ status: 'success', message: 'Login successful', data: { id: user.id, name: user.name, email: user.email, accessToken, refreshToken } });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.userId]);
    if (users.length === 0) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.status(200).json({ status: 'success', data: users[0] });
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe };