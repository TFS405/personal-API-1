// ---------- IMPORTING MODULES
const { promisify } = require('util');

const JWT = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utility/appError');

// -----------CONFIGURING ENVIRONMENTAL VARIABLES
require('dotenv').config({ path: '../config/.env' });

// --------- FUNCTIONS -----------

const protectRoute = async (req, res, next) => {
  // 1. VERIFY TOKEN EXISTENCE
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. VERIFY TOKEN VALIDITY
  const promisifyResults = await promisify(JWT.verify)(token, process.env.JWT_SECRET).catch(
    (err) => {
      return next(new AppError('Please login again!', 401));
    }
  );

  if (!promisifyResults?.id && !promisifyResults?.iat) {
    return;
  }

  const { id, iat } = promisifyResults;
  // 3. CHECK IF USER CHANGED PASSWORDS AFTER THE TOKEN WAS ISSUED

  // 4. CHECK IF USER STILL EXIST
  const user = await User.findById(id);

  // 4-A. A modification is needed to safely check the differences in timestamps between the JWT and the time the password was changed (if at all).
  const fixedTimeStamp = user.passwordChangedAt
    ? parseInt(user.passwordChangedAt.getTime() / 1000, 10)
    : null;

  // If the password was changed after (fixedTimeStamp) the issuing of the JWT (iat), then the token is invalid for security reasons.
  if (fixedTimeStamp && fixedTimeStamp > iat) {
    next(
      new AppError(
        'Password was recently changed! Please login again to delete your this account!',
        401
      )
    );
  }
  req.user = user;
  next();
};

// ------------- MODULE EXPORTS ----------------

module.exports = protectRoute;
