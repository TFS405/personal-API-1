// ----------- IMPORT MODULES -------------------

const sendJsonRes = require('./sendJsonRes');
const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const APIFeatures = require('./apiFeatures');
const filterObj = require('./filterObject.js');
const zodValidator = require('./zodValidator.js');

// ----------- HANDLER FUNCTIONS ----------------

exports.getAll = (model) => {
  return catchAsync(async (req, res, next) => {
    // Applying query parameters to search query
    const features = new APIFeatures(model.find(), req.query).filter();

    // Executing search query (that has been modified by query paremeters such as filter, sort, limit, paginate)
    const docs = await features.query;
    // Obtaining  the amount of results returned from search query
    const results = docs.length;

    // Making sure that "docs" is not an empty / falsy value.
    if (!docs || docs.length === 0) {
      return next(
        new AppError(`Search query returned no results! Please check your search query!`, 404)
      );
    }
    // Sending JSON response
    sendJsonRes(res, 200, {
      results,
      data: docs
    });
  });
};

exports.getOne = (model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await model.findById(req.params.id);

    if (!doc) {
      return next(new AppError('No resource found with that ID!', 404));
    }

    sendJsonRes(res, 200, { user: doc });
  });
};

exports.createOne = (model, zodSchema, ...signupFields) => {
  return catchAsync(async (req, res, next) => {
    // Make sure request body is not empty, and that it actually has at least one key!
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError(`Request body is empty. Please include data in the request`, 400));
    }

    // Filter the request body
    const filtered = filterObj(...signupFields, req.body);

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

exports.updateOne = (model, zodSchema, ...updatableFields) => {
  return catchAsync(async (req, res, next) => {
    // Make sure request body is not empty, and that it actually has at least one key!
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(
        new AppError(
          `Request body is empty. Please include data in the request body to successfully update!`,
          400
        )
      );
    }
    // Filter the request body
    const filtered = filterObj(updatableFields, req.body);

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

    const updatedDoc = await model.findByIdAndUpdate(req.params.id, filtered, {
      new: true
    });

    sendJsonRes(res, 200, { data: updatedDoc });
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

exports.signupUser = (model, zodSchemaObj, ...signupFields) => {
  return catchAsync(async (req, res, next) => {
    // Checking to see if there is indeed a request body
    if (!req.body) {
      return next(
        new AppError('Please provide a username, email, password and password confirmation!', 400)
      );
    }
    // Creating a validation schema to validate input data
    const validationSchema = zodValidator.createzodSchemaObj(validationSchema);

    // Filtering out disallowed properties from input data
    const filtered = filterObj(...signupFields, req.body);
    // Checking if there is still data remaining in "filtered" after filtering
    if (Object.keys(filtered).length === 0) {
      return next(
        new AppError(
          'No valid data was received, please enter a valid username, email and password',
          400
        )
      );
    }
    // Validating input data from request body against validation schema
    zodValidator.validateDataTypes(validationSchema, filtered);

    // Checking if the required signup properties still exist after filtering and validating
    if (
      Object.keys(filtered).length !== signupFields.length ||
      !signupFields.every((el) => el in filtered)
    ) {
      return next(
        new AppError(
          `Data is missing one or more required fields! Required fields: ${signupFields}`
        )
      );
    }

    const newUser = await User.create(filtered);
  });
};
