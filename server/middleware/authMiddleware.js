const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Authentication Middleware
 * Protects routes by validating JWT Bearer tokens
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed token.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { userId, name, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please sign in again.',
    });
  }
};

module.exports = authMiddleware;
