/* In order to facilitate the process of sending large quantities of json responses, I decided to make a reusable helper function that accepts the req object, 
   a status (which will be determined by the condition and value of the status code), a contextually fitting status code and a fourth argument named options 
   that will allow for additonal keys to added to the res obj, such as any additional data or fields that one may wish to send as well.
*/

const sendJsonRes = (statusCode, options = {}) => {
  return (req, res) => {
    const statusCodeString = statusCode.toString();
    let status;

    // I was originally going to include a parameter to prompt the utilizer of this function to input the status as an argument, but I believe that I can facilitate
    // the use of this helper function by deducting what the status logically should be. Depending on the beginning number of the status code, the status will be set!
    if (statusCodeString.startsWith(2)) {
      status = 'successful';
    } else if (statusCodeString.startsWith(4)) {
      status = 'failed';
    } else if (statusCodeString.startsWith(5)) {
      status = 'error';
    } else {
      status = undefined;
      console.log(`⚠️ WARNING ⚠️ A status, within a json response, has been sent as undefined!`);
    }

    return res.status(statusCode).json({
      status: status,
      ...options,
    });
  };
};

// -------------- MODULE EXPORT -----------------------

module.exports = sendJsonRes;
