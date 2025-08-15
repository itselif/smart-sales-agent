const mainFunctions = require("./main");

module.exports = {
  // main Database
  // InventoryItem Db Object
  dbGetInventoryitem: mainFunctions.dbGetInventoryitem,
  dbCreateInventoryitem: mainFunctions.dbCreateInventoryitem,
  dbUpdateInventoryitem: mainFunctions.dbUpdateInventoryitem,
  dbDeleteInventoryitem: mainFunctions.dbDeleteInventoryitem,
  dbListInventoryitems: mainFunctions.dbListInventoryitems,
  createInventoryItem: mainFunctions.createInventoryItem,
  getIdListOfInventoryItemByField:
    mainFunctions.getIdListOfInventoryItemByField,
  getInventoryItemById: mainFunctions.getInventoryItemById,
  getInventoryItemAggById: mainFunctions.getInventoryItemAggById,
  getInventoryItemListByQuery: mainFunctions.getInventoryItemListByQuery,
  getInventoryItemStatsByQuery: mainFunctions.getInventoryItemStatsByQuery,
  getInventoryItemByQuery: mainFunctions.getInventoryItemByQuery,
  updateInventoryItemById: mainFunctions.updateInventoryItemById,
  updateInventoryItemByIdList: mainFunctions.updateInventoryItemByIdList,
  updateInventoryItemByQuery: mainFunctions.updateInventoryItemByQuery,
  deleteInventoryItemById: mainFunctions.deleteInventoryItemById,
  deleteInventoryItemByQuery: mainFunctions.deleteInventoryItemByQuery,
  getInventoryItemByStoreId: mainFunctions.getInventoryItemByStoreId,

  // InventoryMovement Db Object
  dbGetInventorymovement: mainFunctions.dbGetInventorymovement,
  dbCreateInventorymovement: mainFunctions.dbCreateInventorymovement,
  dbDeleteInventorymovement: mainFunctions.dbDeleteInventorymovement,
  dbListInventorymovements: mainFunctions.dbListInventorymovements,
  createInventoryMovement: mainFunctions.createInventoryMovement,
  getIdListOfInventoryMovementByField:
    mainFunctions.getIdListOfInventoryMovementByField,
  getInventoryMovementById: mainFunctions.getInventoryMovementById,
  getInventoryMovementAggById: mainFunctions.getInventoryMovementAggById,
  getInventoryMovementListByQuery:
    mainFunctions.getInventoryMovementListByQuery,
  getInventoryMovementStatsByQuery:
    mainFunctions.getInventoryMovementStatsByQuery,
  getInventoryMovementByQuery: mainFunctions.getInventoryMovementByQuery,
  updateInventoryMovementById: mainFunctions.updateInventoryMovementById,
  updateInventoryMovementByIdList:
    mainFunctions.updateInventoryMovementByIdList,
  updateInventoryMovementByQuery: mainFunctions.updateInventoryMovementByQuery,
  deleteInventoryMovementById: mainFunctions.deleteInventoryMovementById,
  deleteInventoryMovementByQuery: mainFunctions.deleteInventoryMovementByQuery,
  getInventoryMovementByStoreId: mainFunctions.getInventoryMovementByStoreId,

  // LowStockAlert Db Object
  dbGetLowstockalert: mainFunctions.dbGetLowstockalert,
  dbCreateLowstockalert: mainFunctions.dbCreateLowstockalert,
  dbResolveLowstockalert: mainFunctions.dbResolveLowstockalert,
  dbDeleteLowstockalert: mainFunctions.dbDeleteLowstockalert,
  dbListLowstockalerts: mainFunctions.dbListLowstockalerts,
  createLowStockAlert: mainFunctions.createLowStockAlert,
  getIdListOfLowStockAlertByField:
    mainFunctions.getIdListOfLowStockAlertByField,
  getLowStockAlertById: mainFunctions.getLowStockAlertById,
  getLowStockAlertAggById: mainFunctions.getLowStockAlertAggById,
  getLowStockAlertListByQuery: mainFunctions.getLowStockAlertListByQuery,
  getLowStockAlertStatsByQuery: mainFunctions.getLowStockAlertStatsByQuery,
  getLowStockAlertByQuery: mainFunctions.getLowStockAlertByQuery,
  updateLowStockAlertById: mainFunctions.updateLowStockAlertById,
  updateLowStockAlertByIdList: mainFunctions.updateLowStockAlertByIdList,
  updateLowStockAlertByQuery: mainFunctions.updateLowStockAlertByQuery,
  deleteLowStockAlertById: mainFunctions.deleteLowStockAlertById,
  deleteLowStockAlertByQuery: mainFunctions.deleteLowStockAlertByQuery,
  getLowStockAlertByStoreId: mainFunctions.getLowStockAlertByStoreId,
};
