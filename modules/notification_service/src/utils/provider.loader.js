const fs = require("fs");
const path = require("path");

const loadProvider = (type, providerName) => {
  try {
    const providerPath = path.join(
      __dirname,
      `../providers/${type}/${providerName}.provider.js`,
    );
    if (!fs.existsSync(providerPath)) {
      throw new Error(
        `Provider '${providerName}' not found for type '${type}'.`,
      );
    }
    const ProviderClass = require(providerPath);
    return new ProviderClass();
  } catch (error) {
    console.error(`Error loading provider: ${error.message}`);
    throw error;
  }
};

const loadEmailProvider = () => {
  let providerName = process.env.EMAIL_PROVIDER;
  if (!providerName) {
    console.log("EMAIL_PROVIDER is not set, using fake provider");
    providerName = "fake";
  }
  return loadProvider("email", providerName);
};

const loadPushProvider = () => {
  let providerName = process.env.PUSH_PROVIDER;
  if (!providerName) {
    console.log("PUSH_PROVIDER is not set, using fake provider");
    providerName = "fake";
  }
  return loadProvider("push", providerName);
};

const loadSmsProvider = () => {
  let providerName = process.env.SMS_PROVIDER;
  if (!providerName) {
    console.log("SMS_PROVIDER is not set, using fake provider");
    providerName = "fake";
  }
  return loadProvider("sms", providerName);
};

module.exports = { loadEmailProvider, loadPushProvider, loadSmsProvider };
