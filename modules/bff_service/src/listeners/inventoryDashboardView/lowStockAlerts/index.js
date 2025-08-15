const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startLowStockAlertsListener = async () => {
  console.log("Starting LowStockAlerts listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startLowStockAlertsListener;
