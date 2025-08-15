const express = require("express");

// InventoryItem Db Object Rest Api Router
const inventoryItemRouter = express.Router();

// add InventoryItem controllers

// getInventoryItem controller
inventoryItemRouter.get(
  "/inventoryitems/:inventoryItemId",
  require("./get-inventoryitem"),
);
// createInventoryItem controller
inventoryItemRouter.post("/inventoryitems", require("./create-inventoryitem"));
// updateInventoryItem controller
inventoryItemRouter.patch(
  "/inventoryitems/:inventoryItemId",
  require("./update-inventoryitem"),
);
// deleteInventoryItem controller
inventoryItemRouter.delete(
  "/inventoryitems/:inventoryItemId",
  require("./delete-inventoryitem"),
);
// listInventoryItems controller
inventoryItemRouter.get("/inventoryitems", require("./list-inventoryitems"));

module.exports = inventoryItemRouter;
