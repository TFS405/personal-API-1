class APIFeatures {
  constructor(query = {}, queryString = {}) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Making a copy of the query string to be manipulated
    const queryObj = { ...this.queryString };

    // Excluding query operators from queryObj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Converting query comparison operators to mongoose comparison operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Converting query string back into query object
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  async patchDoc(model, identifier, hiddenFieldsToSelect = [], updateObj) {
    let fieldSelection;

    if (hiddenFieldsToSelect.length > 0) {
      fieldSelection = hiddenFieldsToSelect.map((field) => `+${field}`).join(' ');
    }

    this.doc = await model.findById(identifier).select(fieldSelection);

    Object.keys(updateObj).forEach((key) => {
      this.doc[key] = updateObj[key];
    });

    await this.doc.save();

    return this.doc;
  }
}

// ----------- EXPORT ----------------------------

module.exports = APIFeatures;
