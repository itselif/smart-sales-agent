const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startStoreInfoListener = async () => {
  console.log("Starting StoreInfo listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startStoreInfoListener;
