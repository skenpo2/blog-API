const logger = require('../utils/logger');

/**
 * Centralized error-handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error details
  logger.error(`❌ Error: ${message}`);
  logger.error(err.stack); // Logs the full stack trace for debugging

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message);
    return res.status(400).json({ success: false, errors });
  }

  // Handle Duplicate Key Errors (e.g., unique fields like slug)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      errors: [`The ${field} must be unique`],
    });
  }

  // Handle CastErrors (e.g., invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      errors: [`Invalid ${err.path}: ${err.value}`],
    });
  }

  // Handle Unauthorized Errors (JWT or authentication failures)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token. Please log in again.';
  }

  // Handle Forbidden Errors (Access control violations)
  if (err.statusCode === 403) {
    message = 'You do not have permission to perform this action.';
  }

  // Handle Not Found Errors
  if (err.statusCode === 404) {
    message = 'The requested resource was not found.';
  }

  // Handle Method Not Allowed Errors
  if (err.statusCode === 405) {
    message = 'Method Not Allowed.';
  }

  // Default server error response
  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
