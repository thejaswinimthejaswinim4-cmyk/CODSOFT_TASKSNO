// Custom application error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/['"]/g, ''),
    }));
  }

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Duplicate field value entered';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Foreign key reference constraint failed. Ensure referenced entity exists.';
  }

  // Handle JSON parsing syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON payload received';
  }

  // Log unexpected server errors in development
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error(' [Unhandled Error]:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  errorHandler,
};
