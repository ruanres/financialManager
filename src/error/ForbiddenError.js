class ForbiddenError extends Error {
  constructor(message) {
    super(message || 'User is not allowed access this resource');
    this.name = 'ForbiddenError';
  }
}

module.exports = ForbiddenError;
