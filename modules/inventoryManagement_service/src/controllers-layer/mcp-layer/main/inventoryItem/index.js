module.exports = (headers) => {
  // InventoryItem Db Object Rest Api Router
  const inventoryItemMcpRouter = [];
  // getInventoryItem controller
  inventoryItemMcpRouter.push(require("./get-inventoryitem")(headers));
  // createInventoryItem controller
  inventoryItemMcpRouter.push(require("./create-inventoryitem")(headers));
  // updateInventoryItem controller
  inventoryItemMcpRouter.push(require("./update-inventoryitem")(headers));
  // deleteInventoryItem controller
  inventoryItemMcpRouter.push(require("./delete-inventoryitem")(headers));
  // listInventoryItems controller
  inventoryItemMcpRouter.push(require("./list-inventoryitems")(headers));
  return inventoryItemMcpRouter;
};
