module.exports = (headers) => {
  // User Db Object Rest Api Router
  const userMcpRouter = [];
  // createUser controller
  userMcpRouter.push(require("./create-user")(headers));
  // updateUser controller
  userMcpRouter.push(require("./update-user")(headers));
  // deleteUser controller
  userMcpRouter.push(require("./delete-user")(headers));
  // updateUserRole controller
  userMcpRouter.push(require("./update-userrole")(headers));
  // updatePassword controller
  userMcpRouter.push(require("./update-password")(headers));
  // registerTenantUser controller
  userMcpRouter.push(require("./register-tenantuser")(headers));
  // registerStoreOwner controller
  userMcpRouter.push(require("./register-storeowner")(headers));
  // getUser controller
  userMcpRouter.push(require("./get-user")(headers));
  // listUsers controller
  userMcpRouter.push(require("./list-users")(headers));
  return userMcpRouter;
};
