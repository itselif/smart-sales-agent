const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class UserGroupQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("userGroup", [], Op.and, Op.eq, input, wClause);
  }
}
class UserGroupQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("userGroup", []);
  }
}

module.exports = {
  UserGroupQueryCache,
  UserGroupQueryCacheInvalidator,
};
