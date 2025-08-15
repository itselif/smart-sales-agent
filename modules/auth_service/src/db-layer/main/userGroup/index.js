const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbCreateGroup: require("./dbCreateGroup"),
  dbUpdateGroup: require("./dbUpdateGroup"),
  dbGetGroup: require("./dbGetGroup"),
  dbListGroups: require("./dbListGroups"),
  createUserGroup: utils.createUserGroup,
  getIdListOfUserGroupByField: utils.getIdListOfUserGroupByField,
  getUserGroupById: utils.getUserGroupById,
  getUserGroupAggById: utils.getUserGroupAggById,
  getUserGroupListByQuery: utils.getUserGroupListByQuery,
  getUserGroupStatsByQuery: utils.getUserGroupStatsByQuery,
  getUserGroupByQuery: utils.getUserGroupByQuery,
  updateUserGroupById: utils.updateUserGroupById,
  updateUserGroupByIdList: utils.updateUserGroupByIdList,
  updateUserGroupByQuery: utils.updateUserGroupByQuery,
  deleteUserGroupById: utils.deleteUserGroupById,
  deleteUserGroupByQuery: utils.deleteUserGroupByQuery,
};
