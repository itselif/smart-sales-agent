module.exports = {
  // main Database Crud Object Routes Manager Layer Classes
  // InventoryItem Db Object
  GetInventoryItemManager: require("./inventoryItem/get-inventoryitem"),
  CreateInventoryItemManager: require("./inventoryItem/create-inventoryitem"),
  UpdateInventoryItemManager: require("./inventoryItem/update-inventoryitem"),
  DeleteInventoryItemManager: require("./inventoryItem/delete-inventoryitem"),
  ListInventoryItemsManager: require("./inventoryItem/list-inventoryitems"),
  // InventoryMovement Db Object
  GetInventoryMovementManager: require("./inventoryMovement/get-inventorymovement"),
  CreateInventoryMovementManager: require("./inventoryMovement/create-inventorymovement"),
  DeleteInventoryMovementManager: require("./inventoryMovement/delete-inventorymovement"),
  ListInventoryMovementsManager: require("./inventoryMovement/list-inventorymovements"),
  // LowStockAlert Db Object
  GetLowStockAlertManager: require("./lowStockAlert/get-lowstockalert"),
  CreateLowStockAlertManager: require("./lowStockAlert/create-lowstockalert"),
  ResolveLowStockAlertManager: require("./lowStockAlert/resolve-lowstockalert"),
  DeleteLowStockAlertManager: require("./lowStockAlert/delete-lowstockalert"),
  ListLowStockAlertsManager: require("./lowStockAlert/list-lowstockalerts"),
};
