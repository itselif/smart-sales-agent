const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class ReportFileQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("reportFile", [], Op.and, Op.eq, input, wClause);
  }
}
class ReportFileQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("reportFile", []);
  }
}

module.exports = {
  ReportFileQueryCache,
  ReportFileQueryCacheInvalidator,
};
