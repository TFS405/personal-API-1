// REQUIRING ALL MODULES
const app = require('./app');

// Configuring environmental variables
require('dotenv').config({ path: `./config/.env` });

// IMPORTING MODULES
const express = require('express');
const mongoose = require('mongoose');

const connectDB = require('./config/mongoDB');

const port = process.env.PORT || 80;

// Attempting to connect to MongoDB, then starting the server

connectDB(port).then(() => {
  app.listen(port, () => {
    console.log(`Server is now listening on port ${port} ✅`);
  });
});

// SERVER START-UP
