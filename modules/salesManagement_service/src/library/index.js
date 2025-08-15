module.exports = {
  getCurrentTimestamp: require("./functions/getCurrentTimestamp.js"),
  helloWorld: require("./edge/helloWorld.js"),
  ...require("./templates"),
};
