// ---------- MODULE IMPORTS -----------

const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// --------- FUNCTIONS -----------------

exports.signToken = (id) => {
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
};
