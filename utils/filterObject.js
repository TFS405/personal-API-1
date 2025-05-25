// ------------ MODULE IMPORTS ----------------

// ------------- FUNCTION ---------------------

const filterObj = (allowedProperties, givenProperties) => {
  const cleanObj = {};

  Object.keys(givenProperties).forEach((el) => {
    if (allowedProperties.includes(el)) {
      cleanObj[el] = givenProperties[el];
    }
  });

  return cleanObj;
};

// ------------- MODULE EXPORT ---------------

module.exports = filterObj;
