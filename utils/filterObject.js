// ------------ MODULE IMPORTS ----------------

// ------------- FUNCTION ---------------------

const filterObj = (whiteListKeysArray, givenPropertiesObj) => {
  const cleanObj = {};

  // Iterate over the keys of an object.
  Object.keys(givenPropertiesObj).forEach((el) => {
    // Iterate over an array, and check to see if each key in the givenPropertiesObj is included in the array's contents.
    if (whiteListKeysArray.includes(el)) {
      cleanObj[el] = givenPropertiesObj[el];
    }
  });

  return cleanObj;
};

// ------------- MODULE EXPORT ---------------

module.exports = filterObj;
