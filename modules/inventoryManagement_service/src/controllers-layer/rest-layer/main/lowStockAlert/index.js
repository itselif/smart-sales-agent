const express = require("express");

// LowStockAlert Db Object Rest Api Router
const lowStockAlertRouter = express.Router();

// add LowStockAlert controllers

// getLowStockAlert controller
lowStockAlertRouter.get(
  "/lowstockalerts/:lowStockAlertId",
  require("./get-lowstockalert"),
);
// createLowStockAlert controller
lowStockAlertRouter.post("/lowstockalerts", require("./create-lowstockalert"));
// resolveLowStockAlert controller
lowStockAlertRouter.patch(
  "/resolvelowstockalert/:lowStockAlertId",
  require("./resolve-lowstockalert"),
);
// deleteLowStockAlert controller
lowStockAlertRouter.delete(
  "/lowstockalerts/:lowStockAlertId",
  require("./delete-lowstockalert"),
);
// listLowStockAlerts controller
lowStockAlertRouter.get("/lowstockalerts", require("./list-lowstockalerts"));

module.exports = lowStockAlertRouter;
