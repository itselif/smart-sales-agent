module.exports = {
  getCurrentOpenApiSchemaVersion: require("./functions/getCurrentOpenApiSchemaVersion.js"),
  logAdminAction: require("./hooks/logAdminAction.js"),
  helloWorld: require("./edge/helloWorld.js"),
  sendMail: require("./edge/sendMail.js"),
  ...require("./templates"),
};
