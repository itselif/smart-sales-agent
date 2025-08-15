const express = require("express");

// InventoryMovement Db Object Rest Api Router
const inventoryMovementRouter = express.Router();

// add InventoryMovement controllers

// getInventoryMovement controller
inventoryMovementRouter.get(
  "/inventorymovements/:inventoryMovementId",
  require("./get-inventorymovement"),
);
// createInventoryMovement controller
inventoryMovementRouter.post(
  "/inventorymovements",
  require("./create-inventorymovement"),
);
// deleteInventoryMovement controller
inventoryMovementRouter.delete(
  "/inventorymovements/:inventoryMovementId",
  require("./delete-inventorymovement"),
);
// listInventoryMovements controller
inventoryMovementRouter.get(
  "/inventorymovements",
  require("./list-inventorymovements"),
);

module.exports = inventoryMovementRouter;
