// ------------- IMPORTS --------------------

const { z } = require('zod');

// ------------ FUNCTIONS -------------------

// This function will take in a schema that defines properties and their expected data-types, and will also take in an object with properties to
// validate against those matching properties in the schema and their data-types.
exports.validateOrThrow = (schemaObj, dataObjectToValidate, partial = false) => {
  // Creating the zod schema
  const validationSchema = partial ? z.object(schemaObj).partial() : z.object(schemaObj);

  // Utilizing the zod schema to validate input data types
  const validationResults = validationSchema.safeParse(dataObjectToValidate);

  // If validation failed, an error is created with the intention to be caught by a "validationError" edge-casing,
  // where we pass all zod error messages. If an error is thrown, the encompassing function will exit...

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

  // If validation is successful, no error is thrown and a truthy value is returned
  return true;
};
