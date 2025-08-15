const express = require("express");

// UserGroupMember Db Object Rest Api Router
const userGroupMemberRouter = express.Router();

// add UserGroupMember controllers

// createGroupMember controller
userGroupMemberRouter.post("/groupmember", require("./create-groupmember"));
// deleteGroupMember controller
userGroupMemberRouter.delete(
  "/groupmember/:userGroupMemberId",
  require("./delete-groupmember"),
);
// getGroupMember controller
userGroupMemberRouter.get(
  "/groupmember/:userGroupMemberId",
  require("./get-groupmember"),
);
// listGroupMembers controller
userGroupMemberRouter.get("/groupmembers", require("./list-groupmembers"));

module.exports = userGroupMemberRouter;
