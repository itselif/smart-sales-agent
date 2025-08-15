const startSalesDashboardViewListener = require("./salesDashboardView");

const startInventoryDashboardViewListener = require("./inventoryDashboardView");

const startAuditLogViewListener = require("./auditLogView");

const startCrossStoreComparisonViewListener = require("./crossStoreComparisonView");

const startListener = async () => {
  console.log("Starting listener");

  await startSalesDashboardViewListener();

  await startInventoryDashboardViewListener();

  await startAuditLogViewListener();

  await startCrossStoreComparisonViewListener();
};

module.exports = startListener;
