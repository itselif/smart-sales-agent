module.exports = (headers) => {
  // StoreAssignment Db Object Rest Api Router
  const storeAssignmentMcpRouter = [];
  // getStoreAssignment controller
  storeAssignmentMcpRouter.push(require("./get-storeassignment")(headers));
  // createStoreAssignment controller
  storeAssignmentMcpRouter.push(require("./create-storeassignment")(headers));
  // updateStoreAssignment controller
  storeAssignmentMcpRouter.push(require("./update-storeassignment")(headers));
  // deleteStoreAssignment controller
  storeAssignmentMcpRouter.push(require("./delete-storeassignment")(headers));
  // listStoreAssignments controller
  storeAssignmentMcpRouter.push(require("./list-storeassignments")(headers));
  return storeAssignmentMcpRouter;
};
