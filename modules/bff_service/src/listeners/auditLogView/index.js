const runCreateListener = require("./create.listener");
const runUpdateListener = require("./update.listener");
const runDeleteListener = require("./delete.listener");

const startUserInfoListener = require("./userInfo");

const startStoreInfoListener = require("./storeInfo");

const startAuditLogViewListener = async () => {
  console.log("Starting AuditLogView listeners");
  await runCreateListener();
  await runUpdateListener();
  await runDeleteListener();

  await startUserInfoListener();

  await startStoreInfoListener();
};

module.exports = startAuditLogViewListener;
