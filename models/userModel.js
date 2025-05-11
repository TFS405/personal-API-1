// ------------- IMPORTING MODULES ----------------------

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { Schema } = mongoose;

//----------- SCHEMAS ----------------------

// Creating the USER schema
const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please select a username!']
  },
  password: {
    type: String,
    required: [true, 'Please type in a password!'],
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password!'],
    select: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match!'
    }
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid username!'],
    validate: [validator.isEmail, 'Please provide a valid email!']
  }
});

// ------------------ CUSTOM SCHEMA MODELS --------------

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.confirmPassword;
  delete userObject.__v;
  return userObject;
};
// ----------------- MIDDLEWARE -------------------------

/* Middleware function to check if a password has been modified. If so (including creation), this function will run before save() and create(),
 resulting in a hashing of the password before we save it MongoDB.
 */

userSchema.pre('save', async function (next) {
  // 1. Check if the password property has been modified. If so, then hashing is required for security purposes. (NO RAW PASSWORD STRINGS WILL RESIDE IN THE DB)
  if (!this.isModified('password')) return next();

  // 2. Hash the password, since it HAS been modified (or is newly created).
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  /* If the document is new, then that means that it's logically impossible for the password to have ever been changed, so we don't 
   touch the passwordChangedAt variable at all. If it's not new, then we update that property to reflect the current moment in time when the password 
   was changed,  to be referenced in the future of this codebase. */

  // 3. Timestamp the process of updating passwords
  if (!this.isNew) {
    this.passwordChangedAt = Date.now();
  }
  next();
});

//---------------------- MODELS -----------------------------

// Creating a model named User to represent and hold application user data
const User = mongoose.model('User', userSchema);

//------------------ EXPORTS ----------------------------

module.exports = User;
