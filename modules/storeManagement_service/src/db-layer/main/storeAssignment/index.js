const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetStoreassignment: require("./dbGetStoreassignment"),
  dbCreateStoreassignment: require("./dbCreateStoreassignment"),
  dbUpdateStoreassignment: require("./dbUpdateStoreassignment"),
  dbDeleteStoreassignment: require("./dbDeleteStoreassignment"),
  dbListStoreassignments: require("./dbListStoreassignments"),
  createStoreAssignment: utils.createStoreAssignment,
  getIdListOfStoreAssignmentByField: utils.getIdListOfStoreAssignmentByField,
  getStoreAssignmentById: utils.getStoreAssignmentById,
  getStoreAssignmentAggById: utils.getStoreAssignmentAggById,
  getStoreAssignmentListByQuery: utils.getStoreAssignmentListByQuery,
  getStoreAssignmentStatsByQuery: utils.getStoreAssignmentStatsByQuery,
  getStoreAssignmentByQuery: utils.getStoreAssignmentByQuery,
  updateStoreAssignmentById: utils.updateStoreAssignmentById,
  updateStoreAssignmentByIdList: utils.updateStoreAssignmentByIdList,
  updateStoreAssignmentByQuery: utils.updateStoreAssignmentByQuery,
  deleteStoreAssignmentById: utils.deleteStoreAssignmentById,
  deleteStoreAssignmentByQuery: utils.deleteStoreAssignmentByQuery,
};
