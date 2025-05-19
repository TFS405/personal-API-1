// ---------- MODULE IMPORTS ---------------------

const User = require('../models/userModel');
const sendJsonRes = require('../utils/sendJsonRes');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObject');

//-------------------- HANDLER FUNCTIONS ------------------------

// Will return all users from the DB, with a field called "results" that equates to the total number of results return. (2 documents found? results = 2)
exports.getAllUsers = catchAsync(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query);

  features.filter();

  const users = await features.query;

  sendJsonRes(res, 200, {
    totalResults: users.length,
    data: {
      users
    }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // 1. Identify target user
  const targetID = req.params.id;

  // 2. query for targetID
  const targetUser = await User.findById(targetID);

  // 3. Ensure that targetUser was found
  if (!targetUser) {
    return next(new AppError('User not found! Please check the user ID', 404));
  }
  // 4. Return JSON response
  return sendJsonRes(res, 200, { user: targetUser });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  // 1. Authenticate user
  const targetID = req.params.id;
  const userID = req.user._doc._id;

  if (!(userID.toString() === targetID) && !req.user._doc.role.includes('admin')) {
    return next(new AppError('You do not have permission to update this account!', 401));
  }

  // 2. Sanatize new data
  if (!req.body) {
    return next(new AppError('Please enter new information to update account!', 400));
  }
  const cleanBody = filterObj(req.body, 'username', 'email');

  // 3. Find user to change
  const user = await User.findByIdAndUpdate(targetID, cleanBody, {
    runValidators: true,
    // Return the 'new' version of the MongoDB document
    new: true
  });
  // Send json response
  sendJsonRes(res, 205, { user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  // 1. Find and delete user resource
  let selectedId;
  if (!req.body?.id) {
    return next(new AppError('Please provide a user ID to delete!', 404));
  }
  selectedId = req.body.id;

  // 2. verify permisions to delete selected user
  if (!req.user._doc.role.includes('admin') && !(req.user.id === selectedId)) {
    return next(new AppError('You do not have permission to delete this user!', 401));
  }
  // 3. Proceed with user account deletion
  await User.findByIdAndDelete(selectedId);

  // 4. Send json response
  sendJsonRes(res, 204);
});
