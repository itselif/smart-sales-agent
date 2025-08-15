const { EntityCache } = require("common");

class UserGroupMemberEntityCache extends EntityCache {
  constructor() {
    super("userGroupMember", ["groupId", "userId", "ownerId"]);
  }

  async getUserGroupMemberById(userGroupMemberId) {
    const result = await getEntityFromCache(userGroupMemberId);
    return result;
  }

  async getUserGroupMembers(input) {
    const query = {};

    const result = await selectEntityFromCache(query);
    return result;
  }
}

module.exports = {
  UserGroupMemberEntityCache,
};
