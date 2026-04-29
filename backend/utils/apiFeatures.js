/**
 * API Features class for filtering, sorting, searching, and pagination
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Full-text search
  search(fields) {
    if (this.queryString.search) {
      const searchQuery = {
        $or: fields.map((field) => ({
          [field]: { $regex: this.queryString.search, $options: 'i' },
        })),
      };
      this.query = this.query.find(searchQuery);
    }
    return this;
  }

  // Filter (excludes pagination/sort/search fields)
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Sorting
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Field limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Pagination
  paginate(defaultLimit = 10) {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || defaultLimit;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

/**
 * Build pagination metadata
 */
const getPaginationMeta = async (Model, filterQuery, page, limit) => {
  const total = await Model.countDocuments(filterQuery);
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};

module.exports = { APIFeatures, getPaginationMeta };
