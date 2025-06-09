// ---------- MODULE IMPORTS -----------

const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// --------- FUNCTIONS -----------------

exports.signJWT = (id) => {
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
};

exports.createTokenAndHashObj = (numOfBytes, encodingString, { ExpiresIn = 0 }) => {
  let tokenExpiration;
  const returnObj = {};

  const token = crypto.randomBytes(numOfBytes).toString(encodingString);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  if (ExpiresIn > 0) {
    tokenExpiration = Date.now() + ExpiresIn;
    returnObj.tokenExpiration = tokenExpiration;
  }

  returnObj.token = token;
  returnObj.tokenHash = tokenHash;

  return returnObj;
};
