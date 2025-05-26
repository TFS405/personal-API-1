// ----------------- IMPORTING MODULES --------------------------

const JWT = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/userModel');
const handlerFactory = require('../utils/handlerFactory');
const AppError = require('../utils/appError');
const sendJsonRes = require('../utils/sendJsonRes');
const catchAsync = require('../utils/catchAsync');

// ---------------- VARIABLES --------------------

// A function that will create and assign a user a JWT

const fieldDefinitions = {
  username: 'string',
  password: 'string',
  confirmPassword: 'string',
  email: 'string'
};

//-----------  HANDLER FUNCTIONS ---------------

exports.signup = handlerFactory.signupUser(User);

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
