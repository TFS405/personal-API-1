// ---------- IMPORTING MODULES
const JWT = require('jsonwebtoken');

const User = require('../models/userModel');

// -----------CONFIGURING ENVIRONMENTAL VARIABLES
require('dotenv').config({ path: '../config/.env' });

// --------- FUNCTIONS -----------

const protectRoute = async (req, res, next) => {
  // 1. VERIFY TOKEN EXISTENCE
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
  }

  // 2. VERIFY TOKEN VALIDITY
  const { id, iat } = JWT.verify(token, process.env.JWT_SECRET);
  // 3. CHECK IF USER STILL EXIST
  const user = await User.findById(id);
  // 4. CHECK IF USER CHANGED PASSWORDS AFTER THE TOKEN WAS ISSUED
  // 4-A. A modification is needed to safely check the differences in timestamps between the JWT and the time the password was changed (if at all).
  const fixedTimeStamp = user.passwordChangedAt
    ? parseInt(user.passwordChangedAt.getTime() / 1000, 10)
    : null;
  // If the password was changed after (fixedTimeStamp) the issuing of the JWT (iat), then the token is invalid for security reasons.
  if (fixedTimeStamp && fixedTimeStamp > iat) {
    throw new Error(
      'Hell nah, you done fucked up A-A-RON IN THE PROTECT ROUTE FUNCTION, PROTECT ROUTE FILE/FOLDER. THIS IS AN ERROR MESSAGE PLACEHOLDER'
    );
  }
  req.user = user;
  next();
};

// ------------- MODULE EXPORTS ----------------

module.exports = protectRoute;
