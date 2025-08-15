const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class ReportRequestQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("reportRequest", [], Op.and, Op.eq, input, wClause);
  }
}
class ReportRequestQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("reportRequest", []);
  }
}

module.exports = {
  ReportRequestQueryCache,
  ReportRequestQueryCacheInvalidator,
};
