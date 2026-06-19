import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { dataService } from '../models/dataService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_ink_and_echoes_2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'ink_echoes_admin_key_99';

// Helper to generate JWT and set httpOnly cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id || user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '24h'
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user: {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

/**
 * Register an admin user (requires the ADMIN_SECRET)
 */
export const register = async (req, res) => {
  const { username, email, password, adminSecret } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email, and password.' });
    }

    // Verify admin secret to prevent unauthorized account creation
    if (adminSecret !== ADMIN_SECRET) {
      return res.status(401).json({ message: 'Invalid admin secret. Registration denied.' });
    }

    // Check if user already exists
    const existingUser = await dataService.findOne(User, { email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await dataService.create(User, {
      username,
      email,
      passwordHash,
      role: 'admin'
    });

    sendTokenResponse(newUser, 219, res);
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

/**
 * Log in User/Admin
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await dataService.findOne(User, { email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Direct bcrypt comparison (works for mongoose and JSON models)
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

/**
 * Log out user (clears cookie)
 */
export const logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * Get current authenticated user details
 */
export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not logged in.' });
  }
  res.status(200).json({ success: true, user: req.user });
};
