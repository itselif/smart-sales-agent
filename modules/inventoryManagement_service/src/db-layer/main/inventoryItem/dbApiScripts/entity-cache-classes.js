const { EntityCache } = require("common");

class InventoryItemEntityCache extends EntityCache {
  constructor() {
    super("inventoryItem", ["productId", "quantity", "status"]);
  }

  async getInventoryItemById(inventoryItemId) {
    const result = await getEntityFromCache(inventoryItemId);
    return result;
  }

  async getInventoryItems(input) {
    const query = {};

    const result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  InventoryItemEntityCache,
};
