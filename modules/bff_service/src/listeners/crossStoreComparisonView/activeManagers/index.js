const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startActiveManagersListener = async () => {
  console.log("Starting ActiveManagers listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startActiveManagersListener;
