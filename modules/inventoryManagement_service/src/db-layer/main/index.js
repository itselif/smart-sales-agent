const inventoryItemFunctions = require("./inventoryItem");
const inventoryMovementFunctions = require("./inventoryMovement");
const lowStockAlertFunctions = require("./lowStockAlert");

module.exports = {
  // main Database
  // InventoryItem Db Object
  dbGetInventoryitem: inventoryItemFunctions.dbGetInventoryitem,
  dbCreateInventoryitem: inventoryItemFunctions.dbCreateInventoryitem,
  dbUpdateInventoryitem: inventoryItemFunctions.dbUpdateInventoryitem,
  dbDeleteInventoryitem: inventoryItemFunctions.dbDeleteInventoryitem,
  dbListInventoryitems: inventoryItemFunctions.dbListInventoryitems,
  createInventoryItem: inventoryItemFunctions.createInventoryItem,
  getIdListOfInventoryItemByField:
    inventoryItemFunctions.getIdListOfInventoryItemByField,
  getInventoryItemById: inventoryItemFunctions.getInventoryItemById,
  getInventoryItemAggById: inventoryItemFunctions.getInventoryItemAggById,
  getInventoryItemListByQuery:
    inventoryItemFunctions.getInventoryItemListByQuery,
  getInventoryItemStatsByQuery:
    inventoryItemFunctions.getInventoryItemStatsByQuery,
  getInventoryItemByQuery: inventoryItemFunctions.getInventoryItemByQuery,
  updateInventoryItemById: inventoryItemFunctions.updateInventoryItemById,
  updateInventoryItemByIdList:
    inventoryItemFunctions.updateInventoryItemByIdList,
  updateInventoryItemByQuery: inventoryItemFunctions.updateInventoryItemByQuery,
  deleteInventoryItemById: inventoryItemFunctions.deleteInventoryItemById,
  deleteInventoryItemByQuery: inventoryItemFunctions.deleteInventoryItemByQuery,
  getInventoryItemByStoreId: inventoryItemFunctions.getInventoryItemByStoreId,

  // InventoryMovement Db Object
  dbGetInventorymovement: inventoryMovementFunctions.dbGetInventorymovement,
  dbCreateInventorymovement:
    inventoryMovementFunctions.dbCreateInventorymovement,
  dbDeleteInventorymovement:
    inventoryMovementFunctions.dbDeleteInventorymovement,
  dbListInventorymovements: inventoryMovementFunctions.dbListInventorymovements,
  createInventoryMovement: inventoryMovementFunctions.createInventoryMovement,
  getIdListOfInventoryMovementByField:
    inventoryMovementFunctions.getIdListOfInventoryMovementByField,
  getInventoryMovementById: inventoryMovementFunctions.getInventoryMovementById,
  getInventoryMovementAggById:
    inventoryMovementFunctions.getInventoryMovementAggById,
  getInventoryMovementListByQuery:
    inventoryMovementFunctions.getInventoryMovementListByQuery,
  getInventoryMovementStatsByQuery:
    inventoryMovementFunctions.getInventoryMovementStatsByQuery,
  getInventoryMovementByQuery:
    inventoryMovementFunctions.getInventoryMovementByQuery,
  updateInventoryMovementById:
    inventoryMovementFunctions.updateInventoryMovementById,
  updateInventoryMovementByIdList:
    inventoryMovementFunctions.updateInventoryMovementByIdList,
  updateInventoryMovementByQuery:
    inventoryMovementFunctions.updateInventoryMovementByQuery,
  deleteInventoryMovementById:
    inventoryMovementFunctions.deleteInventoryMovementById,
  deleteInventoryMovementByQuery:
    inventoryMovementFunctions.deleteInventoryMovementByQuery,
  getInventoryMovementByStoreId:
    inventoryMovementFunctions.getInventoryMovementByStoreId,

  // LowStockAlert Db Object
  dbGetLowstockalert: lowStockAlertFunctions.dbGetLowstockalert,
  dbCreateLowstockalert: lowStockAlertFunctions.dbCreateLowstockalert,
  dbResolveLowstockalert: lowStockAlertFunctions.dbResolveLowstockalert,
  dbDeleteLowstockalert: lowStockAlertFunctions.dbDeleteLowstockalert,
  dbListLowstockalerts: lowStockAlertFunctions.dbListLowstockalerts,
  createLowStockAlert: lowStockAlertFunctions.createLowStockAlert,
  getIdListOfLowStockAlertByField:
    lowStockAlertFunctions.getIdListOfLowStockAlertByField,
  getLowStockAlertById: lowStockAlertFunctions.getLowStockAlertById,
  getLowStockAlertAggById: lowStockAlertFunctions.getLowStockAlertAggById,
  getLowStockAlertListByQuery:
    lowStockAlertFunctions.getLowStockAlertListByQuery,
  getLowStockAlertStatsByQuery:
    lowStockAlertFunctions.getLowStockAlertStatsByQuery,
  getLowStockAlertByQuery: lowStockAlertFunctions.getLowStockAlertByQuery,
  updateLowStockAlertById: lowStockAlertFunctions.updateLowStockAlertById,
  updateLowStockAlertByIdList:
    lowStockAlertFunctions.updateLowStockAlertByIdList,
  updateLowStockAlertByQuery: lowStockAlertFunctions.updateLowStockAlertByQuery,
  deleteLowStockAlertById: lowStockAlertFunctions.deleteLowStockAlertById,
  deleteLowStockAlertByQuery: lowStockAlertFunctions.deleteLowStockAlertByQuery,
  getLowStockAlertByStoreId: lowStockAlertFunctions.getLowStockAlertByStoreId,
};
