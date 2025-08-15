const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startActiveSellersListener = require("./activeSellers");

const startActiveManagersListener = require("./activeManagers");

const startCrossStoreComparisonViewListener = async () => {
  console.log("Starting CrossStoreComparisonView listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();

  await startActiveSellersListener();

  await startActiveManagersListener();
};

module.exports = startCrossStoreComparisonViewListener;
