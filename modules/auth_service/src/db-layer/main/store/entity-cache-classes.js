const { EntityCache } = require("common");

class StoreEntityCache extends EntityCache {
  constructor() {
    super("store", []);
  }

  async getStoreById(storeId) {
    const result = await getEntityFromCache(storeId);
    return result;
  }

  async getStores(input) {
    const query = {};

    const result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  StoreEntityCache,
};
