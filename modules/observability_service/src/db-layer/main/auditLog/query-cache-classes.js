const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class AuditLogQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("auditLog", [], Op.and, Op.eq, input, wClause);
  }
}
class AuditLogQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("auditLog", []);
  }
}

module.exports = {
  AuditLogQueryCache,
  AuditLogQueryCacheInvalidator,
};
