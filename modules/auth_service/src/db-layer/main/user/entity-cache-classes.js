const { EntityCache } = require("common");

class UserEntityCache extends EntityCache {
  constructor() {
    super("user", ["email"]);
  }

  async getUserById(userId) {
    const result = await getEntityFromCache(userId);
    return result;
  }

  async getUsers(input) {
    const query = {};

    const result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  UserEntityCache,
};
