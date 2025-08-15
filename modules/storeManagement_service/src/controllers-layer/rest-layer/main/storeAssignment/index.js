const express = require("express");

// StoreAssignment Db Object Rest Api Router
const storeAssignmentRouter = express.Router();

// add StoreAssignment controllers

// getStoreAssignment controller
storeAssignmentRouter.get(
  "/storeassignments/:storeAssignmentId",
  require("./get-storeassignment"),
);
// createStoreAssignment controller
storeAssignmentRouter.post(
  "/storeassignments",
  require("./create-storeassignment"),
);
// updateStoreAssignment controller
storeAssignmentRouter.patch(
  "/storeassignments/:storeAssignmentId",
  require("./update-storeassignment"),
);
// deleteStoreAssignment controller
storeAssignmentRouter.delete(
  "/storeassignments/:storeAssignmentId",
  require("./delete-storeassignment"),
);
// listStoreAssignments controller
storeAssignmentRouter.get(
  "/storeassignments",
  require("./list-storeassignments"),
);

module.exports = storeAssignmentRouter;
