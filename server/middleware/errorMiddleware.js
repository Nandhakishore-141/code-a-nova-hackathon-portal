/**
 * Handles unknown API routes with a clean 404 JSON payload.
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global Express error-handling middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal server error';

  // Normalize Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const firstError = Object.values(err.errors || {})[0];
    message = firstError ? firstError.message : 'Validation failed';
  }

  // Normalize MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyPattern || {})[0] || 'record';
    message = `A ${duplicateField} with this value already exists.`;
  }

  // Normalize invalid Mongoose ObjectId cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[Error ${statusCode}] ${message}`, err.stack || '');
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  notFound,
  errorHandler,
};

