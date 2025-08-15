const userFunctions = require("./user");
const userGroupFunctions = require("./userGroup");
const userGroupMemberFunctions = require("./userGroupMember");
const storeFunctions = require("./store");

module.exports = {
  // main Database
  // User Db Object
  dbCreateUser: userFunctions.dbCreateUser,
  dbUpdateUser: userFunctions.dbUpdateUser,
  dbDeleteUser: userFunctions.dbDeleteUser,
  dbUpdateUserrole: userFunctions.dbUpdateUserrole,
  dbUpdatePassword: userFunctions.dbUpdatePassword,
  dbRegisterTenantuser: userFunctions.dbRegisterTenantuser,
  dbRegisterStoreowner: userFunctions.dbRegisterStoreowner,
  dbGetUser: userFunctions.dbGetUser,
  dbListUsers: userFunctions.dbListUsers,
  createUser: userFunctions.createUser,
  getIdListOfUserByField: userFunctions.getIdListOfUserByField,
  getUserById: userFunctions.getUserById,
  getUserAggById: userFunctions.getUserAggById,
  getUserListByQuery: userFunctions.getUserListByQuery,
  getUserStatsByQuery: userFunctions.getUserStatsByQuery,
  getUserByQuery: userFunctions.getUserByQuery,
  updateUserById: userFunctions.updateUserById,
  updateUserByIdList: userFunctions.updateUserByIdList,
  updateUserByQuery: userFunctions.updateUserByQuery,
  deleteUserById: userFunctions.deleteUserById,
  deleteUserByQuery: userFunctions.deleteUserByQuery,
  getUserByEmail: userFunctions.getUserByEmail,
  getUserByStoreId: userFunctions.getUserByStoreId,
  dbScriptGetUser: userFunctions.dbScriptGetUser,
  dbScriptUpdateUser: userFunctions.dbScriptUpdateUser,
  dbScriptCreateUser: userFunctions.dbScriptCreateUser,
  dbScriptDeleteUser: userFunctions.dbScriptDeleteUser,
  dbScriptListUsers: userFunctions.dbScriptListUsers,
  dbScriptRegisterStoreowner: userFunctions.dbScriptRegisterStoreowner,
  // UserGroup Db Object
  dbCreateGroup: userGroupFunctions.dbCreateGroup,
  dbUpdateGroup: userGroupFunctions.dbUpdateGroup,
  dbGetGroup: userGroupFunctions.dbGetGroup,
  dbListGroups: userGroupFunctions.dbListGroups,
  createUserGroup: userGroupFunctions.createUserGroup,
  getIdListOfUserGroupByField: userGroupFunctions.getIdListOfUserGroupByField,
  getUserGroupById: userGroupFunctions.getUserGroupById,
  getUserGroupAggById: userGroupFunctions.getUserGroupAggById,
  getUserGroupListByQuery: userGroupFunctions.getUserGroupListByQuery,
  getUserGroupStatsByQuery: userGroupFunctions.getUserGroupStatsByQuery,
  getUserGroupByQuery: userGroupFunctions.getUserGroupByQuery,
  updateUserGroupById: userGroupFunctions.updateUserGroupById,
  updateUserGroupByIdList: userGroupFunctions.updateUserGroupByIdList,
  updateUserGroupByQuery: userGroupFunctions.updateUserGroupByQuery,
  deleteUserGroupById: userGroupFunctions.deleteUserGroupById,
  deleteUserGroupByQuery: userGroupFunctions.deleteUserGroupByQuery,

  // UserGroupMember Db Object
  dbCreateGroupmember: userGroupMemberFunctions.dbCreateGroupmember,
  dbDeleteGroupmember: userGroupMemberFunctions.dbDeleteGroupmember,
  dbGetGroupmember: userGroupMemberFunctions.dbGetGroupmember,
  dbListGroupmembers: userGroupMemberFunctions.dbListGroupmembers,
  createUserGroupMember: userGroupMemberFunctions.createUserGroupMember,
  getIdListOfUserGroupMemberByField:
    userGroupMemberFunctions.getIdListOfUserGroupMemberByField,
  getUserGroupMemberById: userGroupMemberFunctions.getUserGroupMemberById,
  getUserGroupMemberAggById: userGroupMemberFunctions.getUserGroupMemberAggById,
  getUserGroupMemberListByQuery:
    userGroupMemberFunctions.getUserGroupMemberListByQuery,
  getUserGroupMemberStatsByQuery:
    userGroupMemberFunctions.getUserGroupMemberStatsByQuery,
  getUserGroupMemberByQuery: userGroupMemberFunctions.getUserGroupMemberByQuery,
  updateUserGroupMemberById: userGroupMemberFunctions.updateUserGroupMemberById,
  updateUserGroupMemberByIdList:
    userGroupMemberFunctions.updateUserGroupMemberByIdList,
  updateUserGroupMemberByQuery:
    userGroupMemberFunctions.updateUserGroupMemberByQuery,
  deleteUserGroupMemberById: userGroupMemberFunctions.deleteUserGroupMemberById,
  deleteUserGroupMemberByQuery:
    userGroupMemberFunctions.deleteUserGroupMemberByQuery,

  // Store Db Object
  dbCreateStore: storeFunctions.dbCreateStore,
  dbGetStore: storeFunctions.dbGetStore,
  dbGetStorebycodename: storeFunctions.dbGetStorebycodename,
  dbListRegisteredstores: storeFunctions.dbListRegisteredstores,
  createStore: storeFunctions.createStore,
  getIdListOfStoreByField: storeFunctions.getIdListOfStoreByField,
  getStoreById: storeFunctions.getStoreById,
  getStoreAggById: storeFunctions.getStoreAggById,
  getStoreListByQuery: storeFunctions.getStoreListByQuery,
  getStoreStatsByQuery: storeFunctions.getStoreStatsByQuery,
  getStoreByQuery: storeFunctions.getStoreByQuery,
  updateStoreById: storeFunctions.updateStoreById,
  updateStoreByIdList: storeFunctions.updateStoreByIdList,
  updateStoreByQuery: storeFunctions.updateStoreByQuery,
  deleteStoreById: storeFunctions.deleteStoreById,
  deleteStoreByQuery: storeFunctions.deleteStoreByQuery,
  getNextCodenameForStore: storeFunctions.getNextCodenameForStore,
  getStoreByOwnerId: storeFunctions.getStoreByOwnerId,
};
