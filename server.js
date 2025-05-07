// -------- IMPORTING MODULES ---------------

const app = require('./app');
const connectDB = require('./config/mongoDB');

// ---------- ESTABLISH ENVIRONMENTAL VARIABLES ----------------
require('dotenv').config({ path: `./config/.env` });

//------------ SERVER CREATION & INIT --------------------

const port = process.env.PORT || 80;

// Attempting to connect to MongoDB, then starting the server
connectDB(port).then(() => {
  app.listen(port, () => {
    console.log(`Server is now listening on port ${port} ✅`);
  });
});
