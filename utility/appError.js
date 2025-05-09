class appError extends Error {
  constrictor(message, errorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
