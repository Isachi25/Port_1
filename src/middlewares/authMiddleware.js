const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'ISachiJwtSecret';

// Middleware to verify JWT token
function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    logger.error('No token provided');
    return res.status(401).json({
      statusCode: 401,
      message: 'Bad request',
      status: 'error',
      error: 'Unauthorized'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.error('Invalid token format');
    return res.status(401).json({
      statusCode: 401,
      message: 'Bad request',
      status: 'error',
      error: 'Unauthorized'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Error verifying token: ${err.message}`);
    return res.status(401).json({
      statusCode: 401,
      message: 'Bad request',
      status: 'error',
      error: 'Unauthorized'
    });
  }
}

module.exports = {
  authMiddleware
};