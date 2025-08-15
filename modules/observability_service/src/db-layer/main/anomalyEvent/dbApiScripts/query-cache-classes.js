const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AnomalyEventQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("anomalyEvent", [], Op.and, Op.eq, input, wClause);
  }
}
class AnomalyEventQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("anomalyEvent", []);
  }
}

module.exports = {
  AnomalyEventQueryCache,
  AnomalyEventQueryCacheInvalidator,
};
