// ---------- MODULE IMPORTS ---------------------

const mongoose = require('mongoose');

const devLog = require('../utils/devLogs');

// Will connect to MongoDB, then immediately initate a server.
const connectDB = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
  devLog('DB Connected! 🚀');
};

// ---------------- MODULE EXPORT ------------------

module.exports = connectDB;
