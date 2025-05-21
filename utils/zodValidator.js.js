// ------------- IMPORTS --------------------

const { z } = require('zod');

// ------------ FUNCTION -------------------

/* 
This function takes two parameters. The parameter "ZodSchema" expects an object with keys reflecting a MongoDB model property, and the value 
of that key is to reflect the data type. dataObjectToValidate reflects the actual data to validate, before becoming a created MongoDB document.
*/

const validateDataTypes = (zodSchema, dataObjectToValidate) => {
  const validationSchema = z.object(zodSchema);

  const validationResults = validationSchema.safeParse(dataObjectToValidate);

  // If validation failed, an error is created with the intention to be caught by a "validationError" edge-casing,
  // where we pass all zod error messages

  if (!validationResults.success) {
    const err = new Error();
    const errMessages = validationResults.error.issues.map((issue) => issue.message);
    err.name = 'ValidationError';
    err.message = errMessages.join('\n');

    throw err;
  }
  return true;
};

// ----------- MODULE EXPORTS ----------

module.exports = validateDataTypes;
