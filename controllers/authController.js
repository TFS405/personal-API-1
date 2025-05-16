// ----------------- IMPORTING MODULES --------------------------

const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

exports.login = catchAsync(async (req, res, next) => {
  // 1. Establish function variables
  let submittedEmail;
  let submittedPassword;

  // 2. Retrieve submitted credentials in req.body
  if (!req.body.password || !req.body.email) {
    return next(new AppError('Please provide an email and password to login!', 400));
  }

  submittedEmail = req.body.email;
  submittedPassword = req.body.password;

  // 3. Verify existence of submitted data
  if (!submittedEmail || !submittedPassword) {
    return next(new AppError('Please provide an email and password to login!', 400));
  }

  // 3. Retrieve targetUser
  const user = await User.findOne({ email: submittedEmail }).select('+password');
  // 3A. Verify presence of data inside the veriable 'user'
  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  // 4. Compare submitted password to correct password
  const passwordComparisonResults = await bcrypt.compare(submittedPassword, user.password);

  if (!passwordComparisonResults) {
    return next(new AppError('Passwords do not match!', 401));
  }

  // 5. If correct, send JWT inside JSON response
  const token = createToken(user._id);

  sendJsonRes(res, 200, { token });
});
