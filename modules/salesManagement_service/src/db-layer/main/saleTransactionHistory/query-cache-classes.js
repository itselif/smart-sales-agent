const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class SaleTransactionHistoryQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("saleTransactionHistory", [], Op.and, Op.eq, input, wClause);
  }
}
class SaleTransactionHistoryQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("saleTransactionHistory", []);
  }
}

module.exports = {
  SaleTransactionHistoryQueryCache,
  SaleTransactionHistoryQueryCacheInvalidator,
};
