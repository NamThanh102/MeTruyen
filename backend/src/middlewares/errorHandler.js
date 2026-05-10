export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === 'CastError') {
    error = new AppError(`Resource not found with id: ${err.value}`, 404);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new AppError(`${field} already exists. Please use another value.`, 400);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    error = new AppError(`Validation Error: ${messages.join(', ')}`, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    statusCode: error.statusCode,
    message: error.message || 'Internal Server Error'
  });
};

export default {
  AppError,
  errorHandler
};
