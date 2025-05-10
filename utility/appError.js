class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    this.status = statusCode.toString().startsWith('4') ? 'failed' : 'error';
  }
}

//----------------- MODULE EXPORT -----------------

module.exports = AppError;
