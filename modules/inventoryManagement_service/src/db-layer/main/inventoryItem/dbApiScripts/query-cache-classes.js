const { QueryCache, QueryCacheInvalidator } = require("common");

const { Op } = require("sequelize");

class InventoryItemQueryCache extends QueryCache {
  constructor(input, wClause) {
    super(
      "inventoryItem",
      ["productId", "quantity", "status"],
      Op.and,
      Op.eq,
      input,
      wClause,
    );
  }
}
class InventoryItemQueryCacheInvalidator extends QueryCacheInvalidator {
  constructor() {
    super("inventoryItem", ["productId", "quantity", "status"]);
  }
}

module.exports = {
  InventoryItemQueryCache,
  InventoryItemQueryCacheInvalidator,
};
