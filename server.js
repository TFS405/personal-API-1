// ---------- MODULE IMPORTS --------------------

const devLog = require('./utils/devLogs');

// ----------- CATCHING UNHANDLED EXCEPTIONS / REJECTIONS -------------------

process.on('uncaughtException', (err) => {
  devLog('Uncaught Exception:', err);

  process.exit(1); // Exit immediately if server is not defined
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
      devLog(`Server is now listening on port ${port} ✅`);
    });
  })
  .catch((err) => {
    devLog('Failed to connect to MongoDB:', err);
    process.exit(1); // Exit the process if connection fails
  });

// --------- CATCHING UNHANDLED REJECTIONS --------------
process.on('unhandledRejection', (err) => {
  devLog('Unhandled Rejection:', err);
  server.close(() => {
    devLog('Server closed due to unhandled rejection');
    process.exit(1);
  });
});
