const sessionRouter = require("./session-router");
module.exports = {
  createUser: require("./create-user"),
  updateUser: require("./update-user"),
  deleteUser: require("./delete-user"),
  updateUserRole: require("./update-userrole"),
  updatePassword: require("./update-password"),
  registerTenantUser: require("./register-tenantuser"),
  registerStoreOwner: require("./register-storeowner"),
  getUser: require("./get-user"),
  listUsers: require("./list-users"),
  ...sessionRouter,
};
