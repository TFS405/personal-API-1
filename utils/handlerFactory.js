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
    // Creating a query, then applying query parameters.
    const docs = await new APIFeatures(model.find(), req.query).filter().execute();

    // Making sure that "docs" is not an empty / falsy value.
    if (!docs || docs.length === 0) {
      return next(
        new AppError(`Search query returned no results! Please check your search query!`, 404),
      );
    }

    // Obtaining the length, or the amount of documents returned from the query.
    const results = docs.length;

    // Sending JSON response
    sendJsonRes(res, 200, {
      results,
      data: docs,
    });
  });
};

exports.getOne = (model, fieldsToSelectArray) => {
  return catchAsync(async (req, res, next) => {
    // Creating a query, possibly selecting hidden fields then executing it.
    const doc = await new APIFeatures(model.findById(req.params.id), req.query)
      .selectFields(fieldsToSelectArray)
      .execute();

    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }

    sendJsonRes(res, 200, { user: doc });
  });
};

exports.createOne = (model, zodSchema, ...fieldWhiteListArray) => {
  return catchAsync(async (req, res, next) => {
    // Make sure request body is not empty, and that it actually has at least one key!
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError(`Request body is empty. Please include data in the request`, 400));
    }

    // Filter the request body
    const filtered = filterObj(...fieldWhiteListArray, req.body);

    // Make sure that there is still data remaining after filtering
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid properties received in the request body, please submit a valid property!',
          400,
        ),
      );
    }
    // Validate the request body
    zodValidator.validateDataTypes(zodSchema, filtered);

    // Save the request body
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
    // Make sure request body is not empty, and that it actually has at least one key!
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

    // Make sure that there is still data remaining after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          noValidFieldsString ??
            'No valid properties received in the request body, please submit a valid property.',
          400,
        ),
      );
    }

    // Validate the request body. If Validation fails then an error is thrown inside of validateDataTypes, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(zodSchema, filtered, isZodSchemaPartial);

    // Create and await the query update object.
    let query = model.findByIdAndUpdate(req.params.id, filtered, {
      new: true,
      runValidators: true,
    });

    // Checking for selected fields.
    let fieldSelection;

    if (fieldsToSelectArray.length > 0) {
      fieldSelection = fieldsToSelectArray.map((field) => `+${field}`).join(' ');
    }

    // If selected fields were requested, attach select method to query.
    if (fieldSelection) {
      query = query.select(fieldSelection);
    }

    // Execute the query.
    const doc = await query;

    // Check if a document was found.
    if (!doc) {
      return next(new AppError(missingDocString ?? 'No resource found with that ID.', 404));
    }

    // Extract data to send in JSON response.
    const JSONResFields =
      fieldsToSelectArray.length > 0
        ? fieldsToSendArray.reduce((acc, field) => {
            if (field in doc) {
              acc[field] = doc[field];
            }
            return acc;
          }, {})
        : doc;

    // Send back the default json response.
    return sendJsonRes(res, 200, { data: JSONResFields });
  });
};

exports.deleteOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }

    sendJsonRes(res, 204, {});
  });
};

// --------- USER-BASED HANDLER FUNCTIONS -------------

exports.signupUser = (model, zodSchemaObj, fieldWhiteListArray) => {
  return catchAsync(async (req, res, next) => {
    // Checking to see if there is indeed a request body.
    if (!req.body) {
      return next(
        new AppError('Please provide a username, email, password and password confirmation!', 400),
      );
    }
    // Filtering out disallowed properties from input data.
    const filtered = filterObj(fieldWhiteListArray, req.body);

    // Checking if there is still data remaining in "filtered" after filtering.
    if (Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid data was received, please enter a valid username, email and password',
          400,
        ),
      );
    }
    // Validating input data from request body against validation schema.
    zodValidator.validateDataTypes(zodSchemaObj, filtered);

    // Checking if the required signup properties still exist after filtering and validating.
    if (
      Object.keys(filtered).length !== fieldWhiteListArray.length ||
      !fieldWhiteListArray.every((el) => el in filtered)
    ) {
      return next(
        new AppError(
          `Data is missing one or more required fields! Required fields: ${fieldWhiteListArray}`,
          400,
        ),
      );
    }
    // Creating user doc after filtering and validating input data.
    const newUser = await model.create(filtered);

    // Creating JWT
    const token = tokenutils.signJWT(newUser._id);

    // Send json response with token included
    return sendJsonRes(res, 201, {
      data: newUser,
      token,
    });
  });
};

exports.loginUser = (model) => {
  return catchAsync(async (req, res, next) => {
    // Check for presence of email and password in the request body.
    if (!req.body?.password || !req.body?.email) {
      return next(new AppError('Please provide an email and password to login!', 400));
    }
    // Assign email and password from the request body to the submittedEmail and submittedPassword variables, then trim them.
    const { email, password } = req.body;
    const submittedEmail = email.trim();
    const submittedPassword = password.trim();

    // Checking if the submittedEmail and submittedPassword variables are empty.
    if (submittedEmail === '' || submittedPassword === '') {
      return next(
        new AppError(
          'Email or password cannot be empty! Please enter a valid email and password!',
          400,
        ),
      );
    }
    // Retrieving the targeted user doc.
    const user = await model.findOne({ email: submittedEmail }).select('+password');

    // Checking if the user doc was successfully found.
    if (!user) {
      return next(
        new AppError(
          'No user was found with that email. Please try again or create a new account.',
          404,
        ),
      );
    }

    // Comparing the submittedPassword with the saved password in the user doc.
    const isPasswordCorrect = await bcrypt.compare(submittedPassword, user.password);

    // Checking if submittedPassword is correct
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password! Please try again!', 401));
    }

    // If all credentials are correct and present, send json response with JWT
    const token = tokenutils.signJWT(user.id);

    return sendJsonRes(res, 200, { token });
  });
};

exports.updateUser = (model, updateSchema, isZodSchemaPartial = false) => {
  return catchAsync(async (req, res, next) => {
    // Check if user is attempting to change the "password" field. If so, reject request.
    if ('password' in req.body) {
      return next(
        new AppError(
          'Cannot update password through this route. Please use /updateMyPassword instead.',
          400,
        ),
      );
    }

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

    // Validate the request body. If Validation fails then an error is thrown inside of validateDataTypes, otherwise function proceeds as normal.
    zodValidator.validateOrThrow(updateSchema, filtered, isZodSchemaPartial);

    // Find and update the user document
    const userDoc = await model.findByIdAndUpdate(req.user.id, filtered, {
      new: true,
      runValidators: true,
    });

    // Return a JSON response.
    return sendJsonRes(res, 200, { data: { user: userDoc } });
  });
};

exports.forgotPassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // Obtain the given email from the request body.
    const { email } = req.body;

    // Check if the user submitted an email, or if the email field is undefined in the given request body.
    if (!email) {
      return next(new AppError('Please provide an email to reset your password.', 400));
    }
    //  Check if the given email is in a valid email format and structure.
    if (!validator.isEmail(email)) {
      return next(
        new AppError('Invalid email address submitted, please provide a valid email address.', 400),
      );
    }
    // Search for a user account associated with the given email.
    const userDoc = await model.findOne({ email });

    // Check if a user account was found that is associated with the given email, if not then send an error response.
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

    // Save the user document, but deactivate schema validators since not all fields are being updated (only the password reset related fields are).
    await userDoc.save({ validateBeforeSave: false });

    // Send token to user's email.
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${token}`;

    const message = `Forgot your password? Submit a patch request with your new passowrd and passwordConfirm to: ${resetURL}.
    \nIf you didn't forget your password, please ignore this email.`;

    // Attempting to send the email.
    try {
      await sendEmail({
        subject: 'Your password reset token (valid for only 15 minutes).',
        message,
        to: userDoc.email,
      });

      sendJsonRes(res, 200, { message: 'Token sent to email.' });
    } catch (err) {
      userDoc.passwordResetToken = undefined;
      userDoc.passwordResetTokenExpiration = undefined;
      await userDoc.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the mail. Try again later!', 500));
    }
  });
};

exports.resetPassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // URL link to send request to recieve  a password reset token.
    const ForgotPasswordUrl = 'https://127.0.0.1:3000/users/forgotPassword';

    // Hash the given reset token, to be compared to hashed reset token stored in MongoDB.
    const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    // Find user document, using the hashed reset token as the search parameter.
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

    // Destructure password and passwordConfirm values from the request body and check if they are defined
    const { password, passwordConfirm } = req.body;

    if (!password) {
      return next(new AppError('Please provide a new password!', 400));
    }
    if (!passwordConfirm) {
      return next(new AppError('Please confirm your new password!', 400));
    }

    //
    // Check if the given new password is the same as the user's current password. If true, request the user to use a different password.
    const isPasswordSame = await bcrypt.compare(password, userDoc.password);

    if (isPasswordSame) {
      return next(
        new AppError('Your new password must be different from your current password.', 400),
      );
    }

    // Remove the password reset token from the user document before consuming the password reset token.
    userDoc.password = password;
    userDoc.passwordConfirm = password;
    (userDoc.passwordResetToken = undefined), (userDoc.passwordResetTokenExpiration = undefined);
    await userDoc.save();

    // Send a session token to user.
    const JWT = tokenutils.signJWT(userDoc._id);

    sendJsonRes(res, 200, { JWT });
  });
};

exports.updatePassword = (model) => {
  return catchAsync(async (req, res, next) => {
    // Obtain user doc from the user's id (which we already have since this will run after a protect middleware).
    const userDoc = await model.findOne({ _id: req.user.id }).select('+password');

    // Although redundant in some sense, check to make sure a document was returned.
    if (!userDoc) {
      return next('This request cannot be proccessed at this time, please try again later.', 500);
    }
    // Destructure the current password of the user's account from the request body and check if it's defined.
    const { currentPassword } = req.body;
    if (!currentPassword) {
      return next(new AppError('Please provide your current password.', 400));
    }
    // Check if the current password is correct (using bcrypt because the password in the DB is hashed).
    if (!(await bcrypt.compare(currentPassword, userDoc.password))) {
      return next(new AppError('Please ensure that your current password is correct.', 400));
    }
    // Destructure the newPassword and confirmPassword field from the request body and check if newPassword is defined.
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword) {
      return next(new AppError('Please provide a new password!', 400));
    }
    // Check that the new password is different from the current password.
    if (newPassword === currentPassword) {
      return next(
        new AppError('The new password must be different from your current password.', 400),
      );
    }
    // Check that the user confirmed their new password.
    if (!confirmPassword) {
      return next(new AppError('Please confirm your password.', 400));
    }
    // Check that the new password matches the password confirmation
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
