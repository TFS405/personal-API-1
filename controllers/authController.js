const JWT = require('jsonwebtoken');

// importing and requiring environmental variables required
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });

// -------    JWT    -----------

// Creating a helper function to assist in actually creating and sending json web tokens along-side the json response object

const createToken = (id) => {
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
};

// This is the function that I will actually use to create and send json web tokens. It takes a special parameter known as "options" which is an object, that when filled with certain keys/values
// will alter the output of the returned value Here is a list of the available options:

// 1. includeJson ---> This will return a json response object. If false, only the token variable (containing the JWT) will be returned. Functionally defaulted to to true.
// 2. includeUser ---> This option will include the newly created or availabe user data inside the json response object. Functionally defaulted to true.

const createSendToken = (user, statusCode, res, options = {}) => {
  const token = createToken(user._doc._id);

  if (options.includesJson === false) {
    return token;
  }
  const jsonResponse = {
    status: 'success',
    token
  };

  if (options.includeUser === false) {
    return res.status(statusCode).json(jsonResponse);
  }
  jsonResponse.data = user;
  return res.status(statusCode).json(jsonResponse);
};

//-----------  HANDLER FUNCTIONS ---------------

exports.signup = async (req, res) => {
  const newUser = await User.create({
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email
  });
  createSendToken(newUser, 201, res);
};
