const filterObj = (allowedProperties, givenProperties) => {
  const cleanObj = {};

  Object.keys(givenProperties).forEach((key) => {
    if (allowedProperties.includes(key)) {
      cleanObj[key] = givenProperties[key];
    }
  });

  return cleanObj;
};
