// -------- IMPORTING MODULES ---------------

const app = require('./app');
const connectDB = require('./config/mongoDB');

// ---------- ESTABLISH ENVIRONMENTAL VARIABLES ----------------
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') });

//------------ SERVER CREATION & INIT --------------------

const port = process.env.PORT || 80;

// Attempting to connect to MongoDB, then starting the server
connectDB(port).then(() => {
  app.listen(port, () => {
    console.log(`Server is now listening on port ${port} ✅`);
  });
});
