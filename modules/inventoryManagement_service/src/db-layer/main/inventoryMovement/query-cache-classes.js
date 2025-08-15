const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class InventoryMovementQueryCache extends QueryCache {
  constructor(input, wClause) {
    super("inventoryMovement", [], Op.and, Op.eq, input, wClause);
  }
}
class InventoryMovementQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("inventoryMovement", []);
  }
}

module.exports = {
  InventoryMovementQueryCache,
  InventoryMovementQueryCacheInvalidator,
};
