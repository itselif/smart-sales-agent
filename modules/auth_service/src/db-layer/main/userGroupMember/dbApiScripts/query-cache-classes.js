const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class UserGroupMemberQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("userGroupMember", [], Op.and, Op.eq, input, wClause);
  }
}
class UserGroupMemberQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("userGroupMember", []);
  }
}

module.exports = {
  UserGroupMemberQueryCache,
  UserGroupMemberQueryCacheInvalidator,
};
