const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startSellerInfoListener = async () => {
  console.log("Starting SellerInfo listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();
};

module.exports = startSellerInfoListener;
