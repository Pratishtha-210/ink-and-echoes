import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { dataService } from '../models/dataService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_ink_and_echoes_2026';

/**
 * Middleware to authenticate requests via JWT cookie or header
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from cookies or authorization header
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 3. Find user
    const user = await dataService.findById(User, decoded.id);
    if (!user) {
      req.user = null;
      return next();
    }
    
    // 4. Attach user payload
    req.user = {
      id: user._id || user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Guard middleware requiring authentication
 */
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Authenticated session required.' });
  }
  next();
};

/**
 * Guard middleware requiring admin privilege
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Administrative privileges required.' });
  }
  next();
};
