const express = require("express");

// User Db Object Rest Api Router
const userRouter = express.Router();

// add User controllers

// createUser controller
userRouter.post("/users", require("./create-user"));
// updateUser controller
userRouter.patch("/users/:userId", require("./update-user"));
// deleteUser controller
userRouter.delete("/users/:userId", require("./delete-user"));
// updateUserRole controller
userRouter.patch("/userrole/:userId", require("./update-userrole"));
// updatePassword controller
userRouter.patch("/password/:userId", require("./update-password"));
// registerTenantUser controller
userRouter.post("/registertenantuser", require("./register-tenantuser"));
// registerStoreOwner controller
userRouter.post("/registerstoreowner", require("./register-storeowner"));
// getUser controller
userRouter.get("/users/:userId", require("./get-user"));
// listUsers controller
userRouter.get("/users", require("./list-users"));

module.exports = userRouter;
