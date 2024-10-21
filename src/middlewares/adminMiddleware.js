const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'ISachiJwtSecret';

// Middleware to verify JWT token and check if user is an admin
async function adminMiddleware(req, res, next) {
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
    const decodeId = decoded.id;
    const user = await prisma.admin.findUnique({
      where: {
        id: decodeId
      }
    });
    if (!user || user.role !== 'admin') {
      logger.error('User is not an admin');
      return res.status(403).json({
        statusCode: 403,
        message: 'Forbidden',
        status: 'error',
        error: 'Forbidden'
      });
    }
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
  adminMiddleware
};