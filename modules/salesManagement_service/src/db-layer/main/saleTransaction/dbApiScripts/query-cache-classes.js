const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class SaleTransactionQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("saleTransaction", [], Op.and, Op.eq, input, wClause);
  }
}
class SaleTransactionQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("saleTransaction", []);
  }
}

module.exports = {
  SaleTransactionQueryCache,
  SaleTransactionQueryCacheInvalidator,
};
