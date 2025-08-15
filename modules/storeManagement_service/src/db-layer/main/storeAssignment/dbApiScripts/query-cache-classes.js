const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class StoreAssignmentQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("storeAssignment", [], Op.and, Op.eq, input, wClause);
  }
}
class StoreAssignmentQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("storeAssignment", []);
  }
}

module.exports = {
  StoreAssignmentQueryCache,
  StoreAssignmentQueryCacheInvalidator,
};
