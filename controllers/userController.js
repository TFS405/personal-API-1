const User = require('../models/userModel');

// Will return all users from the DB, with a field called "results" that equates to the total number of results return. (2 documents found? results = 2)
exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'successful',
    results: users.Length,
    users
  });
};
