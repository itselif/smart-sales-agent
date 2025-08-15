const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class StoreQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("store", [], Op.and, Op.eq, input, wClause);
  }
}
class StoreQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("store", []);
  }
}

module.exports = {
  StoreQueryCache,
  StoreQueryCacheInvalidator,
};
