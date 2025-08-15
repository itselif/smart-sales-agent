module.exports = {
  StoreManagementServiceManager: require("./service-manager/StoreManagementServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // Store Db Object
  GetStoreManager: require("./main/store/get-store"),
  CreateStoreManager: require("./main/store/create-store"),
  UpdateStoreManager: require("./main/store/update-store"),
  DeleteStoreManager: require("./main/store/delete-store"),
  ListStoresManager: require("./main/store/list-stores"),
  // StoreAssignment Db Object
  GetStoreAssignmentManager: require("./main/storeAssignment/get-storeassignment"),
  CreateStoreAssignmentManager: require("./main/storeAssignment/create-storeassignment"),
  UpdateStoreAssignmentManager: require("./main/storeAssignment/update-storeassignment"),
  DeleteStoreAssignmentManager: require("./main/storeAssignment/delete-storeassignment"),
  ListStoreAssignmentsManager: require("./main/storeAssignment/list-storeassignments"),
};
