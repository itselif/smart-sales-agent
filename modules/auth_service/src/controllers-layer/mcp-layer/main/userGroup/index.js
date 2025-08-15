module.exports = (headers) => {
  // UserGroup Db Object Rest Api Router
  const userGroupMcpRouter = [];
  // createGroup controller
  userGroupMcpRouter.push(require("./create-group")(headers));
  // updateGroup controller
  userGroupMcpRouter.push(require("./update-group")(headers));
  // getGroup controller
  userGroupMcpRouter.push(require("./get-group")(headers));
  // listGroups controller
  userGroupMcpRouter.push(require("./list-groups")(headers));
  return userGroupMcpRouter;
};
