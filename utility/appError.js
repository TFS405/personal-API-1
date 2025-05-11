class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    this.status = statusCode.toString().startsWith('4') ? 'failed' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

//----------------- MODULE EXPORT -----------------

module.exports = AppError;
