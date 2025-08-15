module.exports = (headers) => {
  // InventoryMovement Db Object Rest Api Router
  const inventoryMovementMcpRouter = [];
  // getInventoryMovement controller
  inventoryMovementMcpRouter.push(require("./get-inventorymovement")(headers));
  // createInventoryMovement controller
  inventoryMovementMcpRouter.push(
    require("./create-inventorymovement")(headers),
  );
  // deleteInventoryMovement controller
  inventoryMovementMcpRouter.push(
    require("./delete-inventorymovement")(headers),
  );
  // listInventoryMovements controller
  inventoryMovementMcpRouter.push(
    require("./list-inventorymovements")(headers),
  );
  return inventoryMovementMcpRouter;
};
