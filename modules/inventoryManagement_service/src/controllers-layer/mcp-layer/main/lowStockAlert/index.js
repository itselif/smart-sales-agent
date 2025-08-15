module.exports = (headers) => {
  // LowStockAlert Db Object Rest Api Router
  const lowStockAlertMcpRouter = [];
  // getLowStockAlert controller
  lowStockAlertMcpRouter.push(require("./get-lowstockalert")(headers));
  // createLowStockAlert controller
  lowStockAlertMcpRouter.push(require("./create-lowstockalert")(headers));
  // resolveLowStockAlert controller
  lowStockAlertMcpRouter.push(require("./resolve-lowstockalert")(headers));
  // deleteLowStockAlert controller
  lowStockAlertMcpRouter.push(require("./delete-lowstockalert")(headers));
  // listLowStockAlerts controller
  lowStockAlertMcpRouter.push(require("./list-lowstockalerts")(headers));
  return lowStockAlertMcpRouter;
};
