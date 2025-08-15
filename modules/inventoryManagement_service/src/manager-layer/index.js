module.exports = {
  InventoryManagementServiceManager: require("./service-manager/InventoryManagementServiceManager"),
  // main Database Crud Object Routes Manager Layer Classes
  // InventoryItem Db Object
  GetInventoryItemManager: require("./main/inventoryItem/get-inventoryitem"),
  CreateInventoryItemManager: require("./main/inventoryItem/create-inventoryitem"),
  UpdateInventoryItemManager: require("./main/inventoryItem/update-inventoryitem"),
  DeleteInventoryItemManager: require("./main/inventoryItem/delete-inventoryitem"),
  ListInventoryItemsManager: require("./main/inventoryItem/list-inventoryitems"),
  // InventoryMovement Db Object
  GetInventoryMovementManager: require("./main/inventoryMovement/get-inventorymovement"),
  CreateInventoryMovementManager: require("./main/inventoryMovement/create-inventorymovement"),
  DeleteInventoryMovementManager: require("./main/inventoryMovement/delete-inventorymovement"),
  ListInventoryMovementsManager: require("./main/inventoryMovement/list-inventorymovements"),
  // LowStockAlert Db Object
  GetLowStockAlertManager: require("./main/lowStockAlert/get-lowstockalert"),
  CreateLowStockAlertManager: require("./main/lowStockAlert/create-lowstockalert"),
  ResolveLowStockAlertManager: require("./main/lowStockAlert/resolve-lowstockalert"),
  DeleteLowStockAlertManager: require("./main/lowStockAlert/delete-lowstockalert"),
  ListLowStockAlertsManager: require("./main/lowStockAlert/list-lowstockalerts"),
};
