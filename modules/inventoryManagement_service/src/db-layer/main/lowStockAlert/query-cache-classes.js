const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class LowStockAlertQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("lowStockAlert", [], Op.and, Op.eq, input, wClause);
  }
}
class LowStockAlertQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("lowStockAlert", []);
  }
}

module.exports = {
  LowStockAlertQueryCache,
  LowStockAlertQueryCacheInvalidator,
};
