// ----------- IMPORT MODULES -------------------

// --- NPM MODULE IMPORTS ---

const zodValidator = require('./zodValidator.js');
const validator = require('validator');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// --- UTILITY IMPORTS ---

const sendJsonRes = require('./sendJsonRes');
const sendEmail = require('../utils/email.js');

const APIFeatures = require('./apiFeatures');
const tokenutils = require('./tokenUtils.js');

const catchAsync = require('./catchAsync');
const AppError = require('./appError');

const filterObj = require('./filterObject.js');

// ----------- NON-SPECIFIC HANDLER FUNCTIONS ----------------

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    // Retrieve all documents, applying any given filters.
    const docs = await new APIFeatures(model.find(), req.query).filter().execute();

    // Check if any documents were found.
    if (!docs || docs.length === 0) {
      return next(
        new AppError(`Search query returned no results! Please check your search query!`, 404),
      );
    }
    // Retrieve the number of documents that were found.
    const results = docs.length;

    // Send a JSON response.
    sendJsonRes(res, 200, {
      results,
      data: docs,
    });
  });
};

exports.getOne = (model, fieldsToSelectArray) => {
  return catchAsync(async (req, res, next) => {
    // Retrieve the requested user document, applying any given filters and field selections.
    const doc = await new APIFeatures(model.findById(req.params.id), req.query)
      .selectFields(fieldsToSelectArray)
      .execute();

    // Check to see if a user document was successfully found.
    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }

    // Send a JSON response.
    sendJsonRes(res, 200, { user: doc });
  });
};

exports.createOne = (model, zodSchema, ...fieldWhiteListArray) => {
  return catchAsync(async (req, res, next) => {
    // Check if request body is empty.
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError(`Request body is empty. Please include data in the request`, 400));
    }

    // Filter the request body
    const filtered = filterObj(...fieldWhiteListArray, req.body);

    // Check if there are still fields left in the request body after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid properties received in the request body, please submit a valid property!',
          400,
        ),
      );
    }
    // Validate the request body. If validation fails then an error is thrown inside of validateOrThrow, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(zodSchema, filtered);

    // Create a new document using the filtered data.
    const doc = await model.create(filtered);

    // Return JSON response
    sendJsonRes(res, 201, {
      data: { doc },
    });
  });
};

exports.updateOne = (
  model,
  zodSchema,
  {
    isZodSchemaPartial = false,
    selectHiddenFields: fieldsToSelectArray = [],
    // Allows custom error messages to be used.
    configErrorMessage: { emptyBodyString, noValidFieldsString, missingDocString } = {},
    // Option parameter to send specific fields inside the json response.
    configJsonRes: fieldsToSendArray = [],
  } = {},
) => {
  return catchAsync(async (req, res, next) => {
    //
    // Check if the request body is empty.
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(
        new AppError(
          emptyBodyString ??
            `Request body is empty. Please include data in the request body to successfully update.`,
          400,
        ),
      );
    }

    // Filter the request body
    const filtered = filterObj(Object.keys(zodSchema), req.body);

    // Check if there is still data remaining after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          noValidFieldsString ??
            'No valid properties received in the request body, please submit a valid property.',
          400,
        ),
      );
    }

    // Validate the request body. If Validation fails then an error is thrown inside of validateOrThrow, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(zodSchema, filtered, isZodSchemaPartial);

    // Retrieve document and then update it.
    let query = model.findByIdAndUpdate(req.params.id, filtered, {
      new: true,
      runValidators: true,
    });

    // Checking for selected fields.
    let fieldSelection;

    if (fieldsToSelectArray.length > 0) {
      fieldSelection = fieldsToSelectArray.map((field) => `+${field}`).join(' ');
    }

    // If selected fields were requested, attach the select method to the query.
    if (fieldSelection) {
      query = query.select(fieldSelection);
    }

    // Execute the query.
    const doc = await query;

    // Check if a document was found.
    if (!doc) {
      return next(new AppError(missingDocString ?? 'No resource found with that ID.', 404));
    }

    // Manually shape the JSON response based on `fieldsToSendArray`.
    // If an array is provided, only those fields will be included in the final output.
    // Otherwise, return the entire document as-is.

    const JSONResFields = fieldsToSendArray
      ? fieldsToSendArray.reduce((acc, field) => {
          if (field in doc) {
            acc[field] = doc[field];
          }
          return acc;
        }, {})
      : doc;

    // Send back the default JSON response.
    return sendJsonRes(res, 200, { data: JSONResFields });
  });
};

exports.deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    // Delete a document that's associated with a specific, given ID.
    const doc = await model.findByIdAndDelete(req.params.id);

    // Check if a document was successfuly found.
    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }
    // Send a JSON response.
    sendJsonRes(res, 204, {});
  });
};

// --------- USER-BASED HANDLER FUNCTIONS -------------

exports.signupUser = (model, zodSchemaObj, fieldWhiteListArray) => {
  return catchAsync(async (req, res, next) => {
    // Check to see if the request body is empty.
    if (!req.body) {
      return next(
        new AppError('Please provide a username, email, password and password confirmation!', 400),
      );
    }
    // Filter the request body.
    const filtered = filterObj(fieldWhiteListArray, req.body);

    // Check if there are still fields left in the request body after filtering.
    if (Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid data was received, please enter a valid username, email and password',
          400,
        ),
      );
    }
    // Validate the request body. If validation fails then an error is thrown inside of validateOrThrow, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(zodSchemaObj, filtered);

    // Create a user document using the filtered data from the request body.
    const newUser = await model.create(filtered);

    // Create a JWT.
    const JWT = tokenutils.signJWT(newUser._id);

    // Send a JSON response with a JWT included.
    return sendJsonRes(res, 201, {
      data: newUser,
      JWT,
    });
  });
};

exports.loginUser = (model) => {
  return catchAsync(async (req, res, next) => {
    // Check for presence of the email and password fields in the request body.
    if (!req.body?.password || !req.body?.email) {
      return next(new AppError('Please provide an email and password to login!', 400));
    }
    // Assign the email and password fields from the request body to the submittedEmail and submittedPassword variables, then trim them.
    const { email, password } = req.body;
    const submittedEmail = email.trim();
    const submittedPassword = password.trim();

    // Check if the submittedEmail and submittedPassword variables are empty or undefined.
    if (submittedEmail === '' || submittedPassword === '') {
      return next(
        new AppError(
          'Email or password cannot be empty! Please enter a valid email and password!',
          400,
        ),
      );
    }
    // Retrieve the targeted user document.
    const userDoc = await model.findOne({ email: submittedEmail }).select('+password +isActive');

    // Check if the user document was successfully found.
    if (!userDoc) {
      return next(
        new AppError(
          'No user was found with that email. Please try again or create a new account.',
          404,
        ),
      );
    }
    // Compare the submittedPassword with the saved password in the user document.
    const isPasswordCorrect = await bcrypt.compare(submittedPassword, userDoc.password);

    // Check if the submitted password is correct.
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password! Please try again!', 401));
    }

    // Check if the user's account is active. If not, reactivate the user's account and initialize the reactivation message.
    const responsePayload = {};

    if (!userDoc.isActive) {
      userDoc.isActive = true;
      await userDoc.save();

      responsePayload.message = 'Your account has been reactivated!';
    }
    // Include a JWT and the user's document in the response payload.
    responsePayload.data = userDoc;
    responsePayload.token = tokenutils.signJWT(userDoc.id);

    // Send a JSON response with a JWT.
    return sendJsonRes(res, 200, responsePayload);
  });
};

exports.updateUser = (model, updateSchema, isZodSchemaPartial = false) => {
  return catchAsync(async (req, res, next) => {
    // Filter the request body.
    const filtered = filterObj(Object.keys(updateSchema), req.body);

    // Make sure that there is still data remaining after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          `No valid fields received in the request body, please submit a valid field. Valid fields include ${Object.keys(updateSchema).join(', ')}.`,
          400,
        ),
      );
    }

    // Validate the request body. If Validation fails then an error is thrown inside of validateOrThrow, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(updateSchema, filtered, isZodSchemaPartial);

    // Find the user document.
    const userDoc = await model.findById(req.params.id);

    // Update the user document.
    Object.keys(filtered).forEach((key) => {
      userDoc[key] = filtered[key];
    });
    // Save the user document.
    userDoc.save();

    // Return a JSON response.
    return sendJsonRes(res, 200, { data: { user: userDoc } });
  });
};

exports.forgotPassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // Destructure the email field from the request body.
    const { email } = req.body;

    // Check if the destructured email field is empty or undefined.
    if (!email) {
      return next(new AppError('Please provide an email to reset your password.', 400));
    }
    //  Check if the given email is in a valid email format.
    if (!validator.isEmail(email)) {
      return next(
        new AppError('Invalid email address submitted, please provide a valid email address.', 400),
      );
    }
    // Query for a user document associated with the given email.
    const userDoc = await model.findOne({ email });

    // Check if a user document was found to be associated with the given email.
    if (!userDoc) {
      return next(new AppError('No document was found with that email, please try again.', 404));
    }
    // Create a hex token to be sent to the user's email, and hash it before storing it in the DB.
    const { token, tokenHash, tokenExpiration } = tokenutils.createTokenAndHashObj(32, 'hex', {
      expiresIn: 15 * 60 * 1000,
    });

    // Update the user document in MongoDB to store the hashed version of the reset token, and the time in which the token is set to expire.
    userDoc.passwordResetToken = tokenHash;
    userDoc.passwordResetTokenExpiration = tokenExpiration;

    // Save the user document, but deactivate schema validators since not all fields are being updated (only the password reset related fields).
    await userDoc.save({ validateBeforeSave: false });

    // Send the hex token to user's email.
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${token}`;

    // Create a message to be sent in the reset password email.
    const message = `Forgot your password? Submit a patch request with your new passowrd and passwordConfirm to: ${resetURL}.
    \nIf you didn't forget your password, please ignore this email.`;

    // Attempt to send the email.
    try {
      await sendEmail({
        subject: 'Your password reset token (valid for only 15 minutes).',
        message,
        to: userDoc.email,
      });

      // Send a JSON response confirming that the email has been sent.
      sendJsonRes(res, 200, { message: 'Token sent to email.' });
    } catch {
      // If the attempt to send the reset password email failed, clear the pasword reset related fields in the user document.
      userDoc.passwordResetToken = undefined;
      userDoc.passwordResetTokenExpiration = undefined;
      await userDoc.save({ validateBeforeSave: false });

      // Return an error explaining that the email was unsuccessfully sent.
      return next(new AppError('There was an error sending the mail. Try again later!', 500));
    }
  });
};

exports.resetPassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // URL link to send a request to recieve  a password reset token.
    const ForgotPasswordUrl = 'https://127.0.0.1:3000/users/forgotPassword';

    // Hash the given reset token, to be compared to the hashed reset token stored in MongoDB.
    const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    // Find the user document, using the hashed reset token as the search argument.
    const userDoc = await model.findOne({ passwordResetToken: hashedToken }).select('+password');

    // Check if a user document was succesfully found (with a matching, hashed resetPasswordToken).
    if (!userDoc) {
      return next(
        new AppError(
          `Token is invalid or has expired. Please send another request to reset your password at ${ForgotPasswordUrl}.`,
          400,
        ),
      );
    }

    // Check if the given reset token is expired.
    const currentTime = Date.now();

    if (currentTime > userDoc.passwordResetTokenExpiration) {
      return next(
        new AppError(
          `Token is invalid or has expired. Please send another request to reset your password at ${ForgotPasswordUrl}.`,
          400,
        ),
      );
    }

    // Destructure the password and passwordConfirm fields from the request body and check if they are defined.
    const { password, passwordConfirm } = req.body;

    if (!password) {
      return next(new AppError('Please provide a new password!', 400));
    }
    if (!passwordConfirm) {
      return next(new AppError('Please confirm your new password!', 400));
    }

    //
    // Check if the new password is the same as the user's current password. If true, request the user to use a different password.
    const isPasswordSame = await bcrypt.compare(password, userDoc.password);

    if (isPasswordSame) {
      return next(
        new AppError('Your new password must be different from your current password.', 400),
      );
    }

    // Remove the password reset token from the user's document before consuming the password reset token.
    userDoc.password = password;
    userDoc.passwordConfirm = password;
    userDoc.passwordResetToken = undefined;
    userDoc.passwordResetTokenExpiration = undefined;
    await userDoc.save();

    // Create a JWT.
    const JWT = tokenutils.signJWT(userDoc._id);

    // Send a JWT.
    sendJsonRes(res, 200, { JWT });
  });
};

exports.updateMyPassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // Obtain a user's document using the user's ID that is stored in the req parameter.
    const userDoc = await model.findOne({ _id: req.user.id }).select('+password');

    // Perhaps redundant, check to make sure a document was returned.
    if (!userDoc) {
      return next(
        new AppError(
          'This request cannot be proccessed at this time, please try again later.',
          500,
        ),
      );
    }
    // Destructure the current password of the user's account from the request body and check if it's defined.
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return next(new AppError('Please provide your current password.', 400));
    }
    // Check if the current password is correct (using bcrypt because the password in the DB is hashed using bcrypt).
    if (!(await bcrypt.compare(currentPassword, userDoc.password))) {
      return next(new AppError('Please ensure that your current password is correct.', 400));
    }
    // Destructure the newPassword and confirmPassword fields from the request body and check if newPassword is defined.
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return next(new AppError('Please provide a new password!', 400));
    }
    // Check that the new password is different from the user's current password.
    if (newPassword === currentPassword) {
      return next(
        new AppError('The new password must be different from your current password.', 400),
      );
    }
    // Check that the user confirmed their new password.
    if (!confirmPassword) {
      return next(new AppError('Please confirm your password.', 400));
    }
    // Check that the new password matches the password confirmation.
    if (confirmPassword !== newPassword) {
      return next(
        new AppError('Passwords do not match. Please make sure both fields are identical.', 400),
      );
    }

    // Update the user's password
    userDoc.password = newPassword;
    await userDoc.save();

    // Create a new JWT.
    const JWT = tokenutils.signJWT(userDoc._id);

    // return JSON response with confirmation that the current password has been updated
    return sendJsonRes(res, 200, { message: 'Password was successfully updated!', token: JWT });
  });
};

exports.updateMe = (model, updateSchema, isZodSchemaPartial = false) => {
  return catchAsync(async (req, res, next) => {
    // Check if the request body is empty.
    if (Object.keys(req.body).length <= 0) {
      return next(
        new AppError(
          `No valid fields found in the request body. Valid fields include: ${Object.keys(updateSchema).join(', ')}`,
          400,
        ),
      );
    }
    // Check if the user is attempting to change the "password" field. If so, reject the request.
    if ('password' in req.body) {
      return next(
        new AppError(
          'Cannot update password through this route. Please use users/updateMyPassword instead.',
          400,
        ),
      );
    }
    // Filter the request body.
    const filtered = filterObj(Object.keys(updateSchema), req.body);

    // Check if there is still data remaining after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid properties received in the request body, please submit a valid property.',
          400,
        ),
      );
    }

    // Validate the request body. If Validation fails then an error is thrown inside of validateOrThrow, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(updateSchema, filtered, isZodSchemaPartial);

    const userDoc = await model.findByIdAndUpdate(req.user.id, filtered, { new: true });

    // Check if the user's doc was successfully found.
    if (!userDoc) {
      return next(
        new AppError(
          'This request cannot be proccessed at this time, please try again later.',
          500,
        ),
      );
    }

    // Send a JSON response.
    sendJsonRes(res, 200, { user: userDoc });
  });
};

exports.deleteMe = (model) => {
  return catchAsync(async (req, res, next) => {
    // Check if the request body is empty.
    if (Object.keys(req.body).length <= 0) {
      return next(
        new AppError(
          'No password provided. To delete your account, please include your current password.',
        ),
        400,
      );
    }
    // Retrieve the current user's document.
    const userDoc = await model.findById(req.user.id).select('+password');

    // Check if the user's document was successfully found.
    if (!userDoc) {
      return next(
        new AppError(
          'This request cannot be proccessed at this time, please try again later.',
          500,
        ),
      );
    }

    // Destructure user's password from the request body.
    const { password: submittedPassword } = req.body;

    // Check if the given password is correct.
    if (!(await bcrypt.compare(submittedPassword, userDoc.password))) {
      return next(
        new AppError('Unable to delete account: password did not match. Please try again.', 400),
      );
    }

    // Change user document's active status to false.
    userDoc.isActive = false;
    userDoc.save();

    // Send JSON response with no content(204).
    sendJsonRes(res, 204, {});
  });
};
