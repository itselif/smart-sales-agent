const mainFunctions = require("./main");

module.exports = {
  // main Database
  // Store Db Object
  dbGetStore: mainFunctions.dbGetStore,
  dbCreateStore: mainFunctions.dbCreateStore,
  dbUpdateStore: mainFunctions.dbUpdateStore,
  dbDeleteStore: mainFunctions.dbDeleteStore,
  dbListStores: mainFunctions.dbListStores,
  createStore: mainFunctions.createStore,
  getIdListOfStoreByField: mainFunctions.getIdListOfStoreByField,
  getStoreById: mainFunctions.getStoreById,
  getStoreAggById: mainFunctions.getStoreAggById,
  getStoreListByQuery: mainFunctions.getStoreListByQuery,
  getStoreStatsByQuery: mainFunctions.getStoreStatsByQuery,
  getStoreByQuery: mainFunctions.getStoreByQuery,
  updateStoreById: mainFunctions.updateStoreById,
  updateStoreByIdList: mainFunctions.updateStoreByIdList,
  updateStoreByQuery: mainFunctions.updateStoreByQuery,
  deleteStoreById: mainFunctions.deleteStoreById,
  deleteStoreByQuery: mainFunctions.deleteStoreByQuery,

  // StoreAssignment Db Object
  dbGetStoreassignment: mainFunctions.dbGetStoreassignment,
  dbCreateStoreassignment: mainFunctions.dbCreateStoreassignment,
  dbUpdateStoreassignment: mainFunctions.dbUpdateStoreassignment,
  dbDeleteStoreassignment: mainFunctions.dbDeleteStoreassignment,
  dbListStoreassignments: mainFunctions.dbListStoreassignments,
  createStoreAssignment: mainFunctions.createStoreAssignment,
  getIdListOfStoreAssignmentByField:
    mainFunctions.getIdListOfStoreAssignmentByField,
  getStoreAssignmentById: mainFunctions.getStoreAssignmentById,
  getStoreAssignmentAggById: mainFunctions.getStoreAssignmentAggById,
  getStoreAssignmentListByQuery: mainFunctions.getStoreAssignmentListByQuery,
  getStoreAssignmentStatsByQuery: mainFunctions.getStoreAssignmentStatsByQuery,
  getStoreAssignmentByQuery: mainFunctions.getStoreAssignmentByQuery,
  updateStoreAssignmentById: mainFunctions.updateStoreAssignmentById,
  updateStoreAssignmentByIdList: mainFunctions.updateStoreAssignmentByIdList,
  updateStoreAssignmentByQuery: mainFunctions.updateStoreAssignmentByQuery,
  deleteStoreAssignmentById: mainFunctions.deleteStoreAssignmentById,
  deleteStoreAssignmentByQuery: mainFunctions.deleteStoreAssignmentByQuery,
};
