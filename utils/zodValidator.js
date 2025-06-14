// ------------- IMPORTS --------------------

const { z } = require('zod');

// ------------ FUNCTIONS -------------------

// Validates an input object against a given schema, ensuring each key/value pair matches the expected data type that's defined in the given schema.
exports.validateOrThrow = (schemaObj, objectToValidate, partial = false) => {
  // Creating a zod schema, optionally making each field optional using the given schema object.
  const validationSchema = partial ? z.object(schemaObj).partial() : z.object(schemaObj);

  // Utilizing the given schema to validate the data types in the given object.
  const validationResults = validationSchema.safeParse(objectToValidate);

  // If validation fails, a Zod error with all issues is thrown.
  // This error will be passed to Express's global error-handling middleware.

  if (!validationResults.success) {
    const err = new Error();
    const errMessages = validationResults.error.issues.map((issue) => {
      return `${issue.path}: ${issue.message}`;
    });

    err.name = 'ValidationError';
    err.message = errMessages.join('\n ');

    console.log(`err.message ---> `, err.message);
    throw err;
  }

  // If validation passes, the function returns a truthy value without throwing an error.
  return true;
};
