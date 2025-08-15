const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startActiveSellersListener = async () => {
  console.log("Starting ActiveSellers listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startActiveSellersListener;
