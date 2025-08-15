module.exports = (headers) => {
  // main Database Crud Object Mcp Api Routers
  return {
    inventoryItemMcpRouter: require("./inventoryItem")(headers),
    inventoryMovementMcpRouter: require("./inventoryMovement")(headers),
    lowStockAlertMcpRouter: require("./lowStockAlert")(headers),
  };
};
