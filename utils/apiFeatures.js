// ----------- VARIABLES ---------------

// const queryComparisonOperators = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
// const queryParams = ['page', 'limit', 'sort', 'skip', 'fields', 'exclude'];

// ---------- CLASS CREATION --------------------

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

  selectFields(hiddenFieldsToSelect = []) {
    if (hiddenFieldsToSelect.length > 0) {
      const fieldSelection = hiddenFieldsToSelect.map((field) => `+${field}`).join(' ');

      this.query = this.query.select(fieldSelection);

      return this;
    }

    return this;
  }

  async execute() {
    this.doc = await this.query;
    return this.doc;
  }
}
// ----------- EXPORT ----------------------------

module.exports = APIFeatures;
