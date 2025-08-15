const { Op } = require("sequelize");

/**
 * @author Oğuzhan Aydın
 * @param {Object} model - Sequelize model
 * @param {Object} filter - Filter object
 * @param {Array} include - Include array
 * @param {String} sortBy - Sort by column
 * @param {String} sortDirection - Sort direction
 * @param {Number} page - Current page
 * @param {Number} limit - Number of items per page
 * @param {String} search - Search keyword
 * @param {String} searchBy - Search by column
 */
const BASE_LIMIT = 100;
const pagination = async (
  model,
  filter = {},
  include = [],
  sortBy = null,
  sortDirection = "ASC",
  page = 1,
  limit = BASE_LIMIT,
  formatMethod = null,
) => {
  const options = {
    limit: limit || BASE_LIMIT,
    offset: (page - 1) * (limit || BASE_LIMIT),
  };

  const order = [];
  if (sortBy) {
    order.push([sortBy, sortDirection]);
  }

  const datas = await model.findAndCountAll({
    where: filter,
    order: order,
    ...options,
    include: include,
  });

  return {
    meta: {
      page: page,
      limit: options.limit,
      totalItems: datas.count,
      totalPages: Math.ceil(datas.count / options.limit),
      hasNextPage: page < Math.ceil(datas.count / options.limit),
      hasPrevPage: page > 1,
    },
    data: formatMethod
      ? datas.rows.map((data) => data[formatMethod]())
      : datas.rows,
  };
};

module.exports = pagination;
