const { z } = require('zod');

const validateDataTypes = (zodSchema, dataObjectToValidate) => {
  const validationSchema = z.object(zodSchema);

  const validationResults = validationSchema.safeParse(dataObjectToValidate);

  if (!validationResults.success) {
    const err = new Error();
    const errMessages = validationResults.error.issues.map((issue) => issue.message);
    err.name = 'ValidationError';
    err.message = errMessages.join('\n');
  }
};
