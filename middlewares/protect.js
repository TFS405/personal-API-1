// ---------- IMPORTING MODULES
const { promisify } = require('util');

const JWT = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// --------- FUNCTIONS -----------

const protect = (...hiddenFieldsToInclude) => {
  return catchAsync(async (req, res, next) => {
    // Initialize the token variable.
    const token = req.headers.authorization?.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : undefined;

    // Check if token is defined.
    if (!token) {
      return next(new AppError('You are not logged in. Please provide a JWT.', 401));
    }

    // Verify and decode the JWT. If invalid or expired, block the request.
    let decoded;
    try {
      decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
    } catch {
      return next(new AppError('Please login again.', 401));
    }

    // Destructure the JWT's payload.
    const { id, iat } = decoded;

    // Create a search query object using the user's ID.
    let query = User.findById(id);

    // Add any requested fields in hiddenFieldsToInclude to the search query object.
    if (hiddenFieldsToInclude.length > 0) {
      const fieldSelection = hiddenFieldsToInclude.map((field) => `+${field}`).join(' ');
      query = query.select(fieldSelection);
    }

    // Retrieve the user's document.
    const user = await query;

    // Check if the user's document was found.
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // Check if the user's password changed after the JWT was issued.
    if (user.changedPasswordAfter(iat)) {
      return next(new AppError('Password was recently changed. Please login again.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('This user account is inactive.', 404));
    }
    req.user = user;
    next();
  });
};

// ------------- MODULE EXPORTS ----------------

module.exports = protect;
