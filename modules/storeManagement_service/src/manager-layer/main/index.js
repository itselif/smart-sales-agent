module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // Store Db Object
  GetStoreManager: require("./store/get-store"),
  CreateStoreManager: require("./store/create-store"),
  UpdateStoreManager: require("./store/update-store"),
  DeleteStoreManager: require("./store/delete-store"),
  ListStoresManager: require("./store/list-stores"),
  // StoreAssignment Db Object
  GetStoreAssignmentManager: require("./storeAssignment/get-storeassignment"),
  CreateStoreAssignmentManager: require("./storeAssignment/create-storeassignment"),
  UpdateStoreAssignmentManager: require("./storeAssignment/update-storeassignment"),
  DeleteStoreAssignmentManager: require("./storeAssignment/delete-storeassignment"),
  ListStoreAssignmentsManager: require("./storeAssignment/list-storeassignments"),
};
