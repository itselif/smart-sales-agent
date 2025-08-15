const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbCreateGroupmember: require("./dbCreateGroupmember"),
  dbDeleteGroupmember: require("./dbDeleteGroupmember"),
  dbGetGroupmember: require("./dbGetGroupmember"),
  dbListGroupmembers: require("./dbListGroupmembers"),
  createUserGroupMember: utils.createUserGroupMember,
  getIdListOfUserGroupMemberByField: utils.getIdListOfUserGroupMemberByField,
  getUserGroupMemberById: utils.getUserGroupMemberById,
  getUserGroupMemberAggById: utils.getUserGroupMemberAggById,
  getUserGroupMemberListByQuery: utils.getUserGroupMemberListByQuery,
  getUserGroupMemberStatsByQuery: utils.getUserGroupMemberStatsByQuery,
  getUserGroupMemberByQuery: utils.getUserGroupMemberByQuery,
  updateUserGroupMemberById: utils.updateUserGroupMemberById,
  updateUserGroupMemberByIdList: utils.updateUserGroupMemberByIdList,
  updateUserGroupMemberByQuery: utils.updateUserGroupMemberByQuery,
  deleteUserGroupMemberById: utils.deleteUserGroupMemberById,
  deleteUserGroupMemberByQuery: utils.deleteUserGroupMemberByQuery,
};
