// ------------ MODULE IMPORTS ----------------

// ------------- FUNCTION ---------------------

const filterObj = (fieldWhiteList, givenProperties) => {
  const cleanObj = {};

  Object.keys(givenProperties).forEach((el) => {
    if (fieldWhiteList.includes(el)) {
      cleanObj[el] = givenProperties[el];
    }
  });

  return cleanObj;
};

// ------------- MODULE EXPORT ---------------

module.exports = filterObj;
