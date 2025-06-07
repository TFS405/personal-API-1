// ----------- CATCHING UNHANDLED EXCEPTIONS / REJECTIONS -------------------

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (server) {
    server.close(() => {
      console.error('Server closed due to uncaught exception');
      process.exit(1);
    });
  } else {
    process.exit(1); // Exit immediately if server is not defined
  }
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    console.error('Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// -------- IMPORTING MODULES ---------------

const app = require('./app');
const connectDB = require('./config/mongoDB');

// ---------- ESTABLISH ENVIRONMENTAL VARIABLES ----------------

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') });

//------------ SERVER CREATION & INIT --------------------

let server;
const port = process.env.PORT || 80;

// Attempting to connect to MongoDB, then starting the server
connectDB(port)
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server is now listening on port ${port} ✅`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit the process if connection fails
  });
