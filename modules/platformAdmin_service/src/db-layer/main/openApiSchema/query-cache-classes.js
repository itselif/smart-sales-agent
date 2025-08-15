const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class OpenApiSchemaQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("openApiSchema", [], Op.and, Op.eq, input, wClause);
  }
}
class OpenApiSchemaQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("openApiSchema", []);
  }
}

module.exports = {
  OpenApiSchemaQueryCache,
  OpenApiSchemaQueryCacheInvalidator,
};
