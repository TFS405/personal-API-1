// ----------- IMPORT MODULES -------------------

const sendJsonRes = require('./sendJsonRes');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');
const filterObj = require('./filterObject.js');
const zodValidator = require('./zodValidator.js');
const tokenutils = require('./tokenUtils.js');
const bcrypt = require('bcrypt');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    // Creating a query, then applying query parameters.
    const docs = await new APIFeatures(model.find(), req.query).filter().execute();

    // Making sure that "docs" is not an empty / falsy value.
    if (!docs || docs.length === 0) {
      return next(
        new AppError(`Search query returned no results! Please check your search query!`, 404)
      );
    }

    // Obtaining the length, or the amount of documents returned from the query.
    const results = docs.length();

    // Sending JSON response
    sendJsonRes(res, 200, {
      results,
      data: docs
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
          400
        )
      );
    }
    // Validate the request body
    zodValidator.validateDataTypes(zodSchema, filtered);

    // Save the request body
    const doc = await model.create(filtered);

    // Return JSON response
    sendJsonRes(res, 201, {
      data: { doc }
    });
  });
};

exports.updateOne = (
  model,
  zodSchema,
  {
    isZodSchemaPartial = false,
    selectHiddenFields: fieldsToSelectArray = [],
    configErrorMessage: { emptyBodyString, noValidFieldsString, missingDocString } = {},
    configJsonRes: fieldsToSendArray = []
  } = {}
) => {
  return catchAsync(async (req, res, next) => {
    //
    // Make sure request body is not empty, and that it actually has at least one key!
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(
        new AppError(
          emptyBodyString ??
            `Request body is empty. Please include data in the request body to successfully update!`,
          400
        )
      );
    }

    // Filter the request body
    const filtered = filterObj(Object.keys(zodSchema), req.body);

    // Make sure that there is still data remaining after filtering.
    if (!filtered || Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          noValidFieldsString ??
            'No valid properties received in the request body, please submit a valid property!',
          400
        )
      );
    }

    // Validate the request body. If Validation fails then an error is thrown inside of validateDataTypes, or else function proceeds as normal.
    zodValidator.validateOrThrow(zodSchema, filtered, isZodSchemaPartial);

    // Checking for selected fields.
    let fieldSelection;
    if (fieldsToSelectArray.length > 0) {
      fieldSelection = fieldsToSelectArray.map((field) => `+${field}`).join(' ');
    }

    // Create and await the query update object.
    let query = model.findByIdAndUpdate(req.params.id, filtered, {
      new: true,
      runValidators: true
    });

    if (fieldSelection) {
      query = query.select(fieldSelection);
    }

    const doc = await query;

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
        new AppError('Please provide a username, email, password and password confirmation!', 400)
      );
    }
    // Filtering out disallowed properties from input data.
    const filtered = filterObj(fieldWhiteListArray, req.body);

    // Checking if there is still data remaining in "filtered" after filtering.
    if (Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid data was received, please enter a valid username, email and password',
          400
        )
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
          400
        )
      );
    }
    // Creating user doc after filtering and validating input data.
    const newUser = await model.create(filtered);

    // Creating JWT
    const token = tokenutils.signToken(newUser._id);

    // Send json response with token included
    return sendJsonRes(res, 201, {
      data: newUser,
      token
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
          400
        )
      );
    }
    // Retrieving the targeted user doc.
    const user = await model.findOne({ email: submittedEmail }).select('+password');

    // Checking if the user doc was successfully found.
    if (!user) {
      return next(
        new AppError(
          'No user was found with that email. Please try again or create a new account.',
          404
        )
      );
    }

    // Comparing the submittedPassword with the saved password in the user doc.
    const isPasswordCorrect = await bcrypt.compare(submittedPassword, user.password);

    // Checking if submittedPassword is correct
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password! Please try again!', 401));
    }

    // If all credentials are correct and present, send json response with JWT
    const token = tokenutils.signToken(user.id);

    return sendJsonRes(res, 200, { token });
  });
};
