module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // User Db Object
  CreateUserManager: require("./user/create-user"),
  UpdateUserManager: require("./user/update-user"),
  DeleteUserManager: require("./user/delete-user"),
  UpdateUserRoleManager: require("./user/update-userrole"),
  UpdatePasswordManager: require("./user/update-password"),
  RegisterTenantUserManager: require("./user/register-tenantuser"),
  RegisterStoreOwnerManager: require("./user/register-storeowner"),
  GetUserManager: require("./user/get-user"),
  ListUsersManager: require("./user/list-users"),
  // UserGroup Db Object
  CreateGroupManager: require("./userGroup/create-group"),
  UpdateGroupManager: require("./userGroup/update-group"),
  GetGroupManager: require("./userGroup/get-group"),
  ListGroupsManager: require("./userGroup/list-groups"),
  // UserGroupMember Db Object
  CreateGroupMemberManager: require("./userGroupMember/create-groupmember"),
  DeleteGroupMemberManager: require("./userGroupMember/delete-groupmember"),
  GetGroupMemberManager: require("./userGroupMember/get-groupmember"),
  ListGroupMembersManager: require("./userGroupMember/list-groupmembers"),
  // Store Db Object
  CreateStoreManager: require("./store/create-store"),
  GetStoreManager: require("./store/get-store"),
  GetStoreByCodenameManager: require("./store/get-storebycodename"),
  ListRegisteredStoresManager: require("./store/list-registeredstores"),
};
