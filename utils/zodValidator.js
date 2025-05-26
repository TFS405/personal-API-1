// ------------- IMPORTS --------------------

const { z } = require('zod');

const AppError = require('./appError');

// ------------ FUNCTIONS -------------------

// This function will create a zod validation schema from an object containing property names as keys and data types as the value. Supports optional fields.
exports.createValidationSchema = (ObjectOfPropertiesAndDataTypes, optional = false) => {
  // 1. Creating an object to populate with properties and data types before being passed into zod to create a validation schema.
  const validationObj = {};
  const rejectedDataTypes = {};

  // 2. Dynamically create key/value pairs with specific data types within validationObj to be used as a zod validation object schema.
  Object.keys(ObjectOfPropertiesAndDataTypes).forEach((key) => {
    const dataType = ObjectOfPropertiesAndDataTypes[key];

    // 3. Populating validationObj with property and zod data type methods to be passed into zod.object() (with functionality to make fields optional)
    switch (dataType) {
      case 'string':
        optional ? (validationObj[key] = z.string().optional()) : (validationObj[key] = z.string());
        break;
      case 'number':
        optional ? (validationObj[key] = z.number().optional()) : (validationObj[key] = z.number());
        break;
      case 'boolean':
        optional
          ? (validationObj[key] = z.boolean().optional())
          : (validationObj[key] = z.boolean());
        break;
      default:
        console.log(
          `The property: ${key} has been skipped due to an unsupported data type! Rejected data type: ${ObjectOfPropertiesAndDataTypes[key]}`
        );
        rejectedDataTypes[key] = ObjectOfPropertiesAndDataTypes[key];
        break;
    }
  });
  // 4. Logging the list of rejected properties/data types and return the new validation schema, if there were any rejected properties to begin with
  if (Object.keys(rejectedDataTypes).length > 0) {
    console.log(`Rejected data types ---> ${JSON.stringify(rejectedDataTypes, null, 2)}`);
  }

  // 5. Returning an object that can be plugged into z.object() to create a validation schema
  return validationObj;
};

// This function will take in a schema that defines properties and their expected data-types, and will also take in an object with properties to
// validate against those matching properties in the schema and their data-types.
exports.validateDataTypes = (schemaObj, dataObjectToValidate) => {
  // Creating the zod schema
  const validationSchema = z.object(schemaObj);

  // Utilizing the zod schema to validate input data types
  const validationResults = validationSchema.safeParse(dataObjectToValidate);

  // If validation failed, an error is created with the intention to be caught by a "validationError" edge-casing,
  // where we pass all zod error messages ; If error is thrown, encompassing function will exit and request is directed to the error handlers in app.js

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
