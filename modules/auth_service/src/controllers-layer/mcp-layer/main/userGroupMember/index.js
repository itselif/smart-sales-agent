module.exports = (headers) => {
  // UserGroupMember Db Object Rest Api Router
  const userGroupMemberMcpRouter = [];
  // createGroupMember controller
  userGroupMemberMcpRouter.push(require("./create-groupmember")(headers));
  // deleteGroupMember controller
  userGroupMemberMcpRouter.push(require("./delete-groupmember")(headers));
  // getGroupMember controller
  userGroupMemberMcpRouter.push(require("./get-groupmember")(headers));
  // listGroupMembers controller
  userGroupMemberMcpRouter.push(require("./list-groupmembers")(headers));
  return userGroupMemberMcpRouter;
};
