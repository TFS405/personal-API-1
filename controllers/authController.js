// ----------------- IMPORTING MODULES --------------------------

const JWT = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utility/appError');
const sendJsonRes = require('../utility/sendJsonRes');
const catchAsync = require('../utility/catchAsync');
// ---------------- JWT --------------------

// A function that will create and assign a user a JWT

const createToken = (id) => {
  const token = JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  return token;
};

//-----------  HANDLER FUNCTIONS ---------------

exports.signup = catchAsync(async (req, res, next) => {
  if (!req.body) {
    next(new AppError('Please provide a json body!', 400));
  }
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return next(
      new AppError('Please include a valid username, password and email in your request!', 400)
    );
  }

  const newUser = await User.create({
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    email: req.body.email,
    role: req.body.role
  });

  const token = createToken(newUser._id);

  sendJsonRes(res, 201, {
    token,
    user: newUser
  });
});
