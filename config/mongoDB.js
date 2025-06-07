// ---------- MODULE IMPORTS ---------------------

const mongoose = require('mongoose');

// Will connect to MongoDB, then immediately initate a server.
const connectDB = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
  console.log('DB Connected! 🚀');
};

// ---------------- MODULE EXPORT ------------------

module.exports = connectDB;
