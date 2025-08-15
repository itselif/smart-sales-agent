const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class ReportPolicyQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("reportPolicy", [], Op.and, Op.eq, input, wClause);
  }
}
class ReportPolicyQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("reportPolicy", []);
  }
}

module.exports = {
  ReportPolicyQueryCache,
  ReportPolicyQueryCacheInvalidator,
};
