const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = 500;
  let response = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    response.error.code = 'VALIDATION_ERROR';
    response.error.message = err.message;
    response.error.details = err.details;
  }

  // Custom application errors
  if (err.statusCode) {
    status = err.statusCode;
    response.error.code = err.code || 'ERROR';
    response.error.message = err.message;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    response.error.message = 'An unexpected error occurred';
  }

  res.status(status).json(response);
};

module.exports = errorHandler;
