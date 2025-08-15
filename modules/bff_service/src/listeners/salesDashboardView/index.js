const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startStoreInfoListener = require("./storeInfo");

const startSellerInfoListener = require("./sellerInfo");

const startSalesDashboardViewListener = async () => {
  console.log("Starting SalesDashboardView listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();

  await startStoreInfoListener();

  await startSellerInfoListener();
};

module.exports = startSalesDashboardViewListener;
