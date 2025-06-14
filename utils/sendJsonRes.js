//---------- FUNCTION ------------------------------

const sendJsonRes = (statusCode, options = {}) => {
  return (req, res) => {
    // Obtain first digit in status code
    const statusCodeFirstNum = statusCode.toString()[0];

    // Assign status based on the first digit of the status code.
    const status =
      statusCodeFirstNum === '2' ? 'successful' : statusCodeFirstNum === '4' ? 'failed' : 'error';

    // Send the json response.
    return res.status(statusCode).json({
      status,
      ...options,
    });
  };
};

// -------------- MODULE EXPORT -----------------------

module.exports = sendJsonRes;
