const utils = require("./utils");
const dbApiScripts = require("./dbApiScripts");

module.exports = {
  dbGetInventorymovement: require("./dbGetInventorymovement"),
  dbCreateInventorymovement: require("./dbCreateInventorymovement"),
  dbDeleteInventorymovement: require("./dbDeleteInventorymovement"),
  dbListInventorymovements: require("./dbListInventorymovements"),
  createInventoryMovement: utils.createInventoryMovement,
  getIdListOfInventoryMovementByField:
    utils.getIdListOfInventoryMovementByField,
  getInventoryMovementById: utils.getInventoryMovementById,
  getInventoryMovementAggById: utils.getInventoryMovementAggById,
  getInventoryMovementListByQuery: utils.getInventoryMovementListByQuery,
  getInventoryMovementStatsByQuery: utils.getInventoryMovementStatsByQuery,
  getInventoryMovementByQuery: utils.getInventoryMovementByQuery,
  updateInventoryMovementById: utils.updateInventoryMovementById,
  updateInventoryMovementByIdList: utils.updateInventoryMovementByIdList,
  updateInventoryMovementByQuery: utils.updateInventoryMovementByQuery,
  deleteInventoryMovementById: utils.deleteInventoryMovementById,
  deleteInventoryMovementByQuery: utils.deleteInventoryMovementByQuery,
  getInventoryMovementByStoreId: utils.getInventoryMovementByStoreId,
};
