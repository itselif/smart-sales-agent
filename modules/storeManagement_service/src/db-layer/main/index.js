const storeFunctions = require("./store");
const storeAssignmentFunctions = require("./storeAssignment");

module.exports = {
  // main Database
  // Store Db Object
  dbGetStore: storeFunctions.dbGetStore,
  dbCreateStore: storeFunctions.dbCreateStore,
  dbUpdateStore: storeFunctions.dbUpdateStore,
  dbDeleteStore: storeFunctions.dbDeleteStore,
  dbListStores: storeFunctions.dbListStores,
  createStore: storeFunctions.createStore,
  getIdListOfStoreByField: storeFunctions.getIdListOfStoreByField,
  getStoreById: storeFunctions.getStoreById,
  getStoreAggById: storeFunctions.getStoreAggById,
  getStoreListByQuery: storeFunctions.getStoreListByQuery,
  getStoreStatsByQuery: storeFunctions.getStoreStatsByQuery,
  getStoreByQuery: storeFunctions.getStoreByQuery,
  updateStoreById: storeFunctions.updateStoreById,
  updateStoreByIdList: storeFunctions.updateStoreByIdList,
  updateStoreByQuery: storeFunctions.updateStoreByQuery,
  deleteStoreById: storeFunctions.deleteStoreById,
  deleteStoreByQuery: storeFunctions.deleteStoreByQuery,

  // StoreAssignment Db Object
  dbGetStoreassignment: storeAssignmentFunctions.dbGetStoreassignment,
  dbCreateStoreassignment: storeAssignmentFunctions.dbCreateStoreassignment,
  dbUpdateStoreassignment: storeAssignmentFunctions.dbUpdateStoreassignment,
  dbDeleteStoreassignment: storeAssignmentFunctions.dbDeleteStoreassignment,
  dbListStoreassignments: storeAssignmentFunctions.dbListStoreassignments,
  createStoreAssignment: storeAssignmentFunctions.createStoreAssignment,
  getIdListOfStoreAssignmentByField:
    storeAssignmentFunctions.getIdListOfStoreAssignmentByField,
  getStoreAssignmentById: storeAssignmentFunctions.getStoreAssignmentById,
  getStoreAssignmentAggById: storeAssignmentFunctions.getStoreAssignmentAggById,
  getStoreAssignmentListByQuery:
    storeAssignmentFunctions.getStoreAssignmentListByQuery,
  getStoreAssignmentStatsByQuery:
    storeAssignmentFunctions.getStoreAssignmentStatsByQuery,
  getStoreAssignmentByQuery: storeAssignmentFunctions.getStoreAssignmentByQuery,
  updateStoreAssignmentById: storeAssignmentFunctions.updateStoreAssignmentById,
  updateStoreAssignmentByIdList:
    storeAssignmentFunctions.updateStoreAssignmentByIdList,
  updateStoreAssignmentByQuery:
    storeAssignmentFunctions.updateStoreAssignmentByQuery,
  deleteStoreAssignmentById: storeAssignmentFunctions.deleteStoreAssignmentById,
  deleteStoreAssignmentByQuery:
    storeAssignmentFunctions.deleteStoreAssignmentByQuery,
};
