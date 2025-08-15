const express = require("express");

// UserGroup Db Object Rest Api Router
const userGroupRouter = express.Router();

// add UserGroup controllers

// createGroup controller
userGroupRouter.post("/group", require("./create-group"));
// updateGroup controller
userGroupRouter.patch("/group/:userGroupId", require("./update-group"));
// getGroup controller
userGroupRouter.get("/group/:userGroupId", require("./get-group"));
// listGroups controller
userGroupRouter.get("/groups", require("./list-groups"));

module.exports = userGroupRouter;
