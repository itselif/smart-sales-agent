const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startStoreInfoListener = require("./storeInfo");

const startLowStockAlertsListener = require("./lowStockAlerts");

const startInventoryDashboardViewListener = async () => {
  console.log("Starting InventoryDashboardView listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();

  await startStoreInfoListener();

  await startLowStockAlertsListener();
};

module.exports = startInventoryDashboardViewListener;
