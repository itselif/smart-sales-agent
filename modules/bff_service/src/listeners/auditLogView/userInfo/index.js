const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startUserInfoListener = async () => {
  console.log("Starting UserInfo listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startUserInfoListener;
