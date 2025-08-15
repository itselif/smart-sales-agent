module.exports = {
  AuthServiceManager: require("./service-manager/AuthServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // User Db Object
  GetUserManager: require("./main/user/get-user"),
  UpdateUserManager: require("./main/user/update-user"),
  CreateUserManager: require("./main/user/create-user"),
  DeleteUserManager: require("./main/user/delete-user"),
  ListUsersManager: require("./main/user/list-users"),
  RegisterStoreOwnerManager: require("./main/user/register-storeowner"),
  // UserGroup Db Object
  // UserGroupMember Db Object
  // Store Db Object
};
