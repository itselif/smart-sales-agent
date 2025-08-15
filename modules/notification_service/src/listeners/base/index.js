const runEmailSenderListener = require("./email.listener");
const runSMSSenderListener = require("./sms.listener");
const runPushSenderListener = require("./push.listener");

const startBaseListeners = async () => {
  try {
    await runEmailSenderListener();
    await runSMSSenderListener();
    await runPushSenderListener();
    console.log("Start listeners...");
  } catch (error) {}
};

module.exports = startBaseListeners;
