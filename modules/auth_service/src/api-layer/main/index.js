module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // User Db Object
  GetUserManager: require("./user/get-user"),
  UpdateUserManager: require("./user/update-user"),
  CreateUserManager: require("./user/create-user"),
  DeleteUserManager: require("./user/delete-user"),
  ListUsersManager: require("./user/list-users"),
  RegisterStoreOwnerManager: require("./user/register-storeowner"),
  // UserGroup Db Object
  // UserGroupMember Db Object
  // Store Db Object
};
