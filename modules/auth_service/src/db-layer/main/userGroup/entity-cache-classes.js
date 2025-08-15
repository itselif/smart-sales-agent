const { EntityCache } = require("common");

class UserGroupEntityCache extends EntityCache {
  constructor() {
    super("userGroup", ["groupName"]);
  }

  async getUserGroupById(userGroupId) {
    const result = await getEntityFromCache(userGroupId);
    return result;
  }

  async getUserGroups(input) {
    const query = {};

    const result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  UserGroupEntityCache,
};
