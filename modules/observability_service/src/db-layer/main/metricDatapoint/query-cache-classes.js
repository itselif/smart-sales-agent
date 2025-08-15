const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class MetricDatapointQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("metricDatapoint", [], Op.and, Op.eq, input, wClause);
  }
}
class MetricDatapointQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("metricDatapoint", []);
  }
}

module.exports = {
  MetricDatapointQueryCache,
  MetricDatapointQueryCacheInvalidator,
};
