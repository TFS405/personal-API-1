// ---------- IMPORTING MODULES
const { promisify } = require('util');

const JWT = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');

// --------- FUNCTIONS -----------

const protect = async (req, res, next) => {
  // 1. VERIFY TOKEN EXISTENCE
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. VERIFY TOKEN VALIDITY
  if (!token) {
    return next(new AppError(' You are not logged in! Please provide a JWT', 401));
  }

  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET).catch((err) => {
    return next(new AppError('Please login again!', 401));
  });

  if (!decoded?.id || !decoded?.iat) {
    return next(new AppError('Invalid JWT! Please login again', 401));
  }

  const { id, iat } = decoded;

  // 3. Check to see if user still exist
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  // Check if password was changed after JWT was issued
  if (!user.changedPasswordAfter(iat)) {
    return next(new AppError('Password was recently changed! Please login again!', 401));
  }

  req.user = user;
  next();
};

// ------------- MODULE EXPORTS ----------------

module.exports = protect;
