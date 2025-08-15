module.exports = {
  capitalizeFirstLetter: require("./functions/capitalizeFirstLetter.js"),
  sortVersions: require("./functions/sortVersions.js"),
  requestArrived: require("./hooks/requestArrived.js"),
  helloWorld: require("./edge/helloWorld.js"),
  sendMail: require("./edge/sendMail.js"),
  getNextCodenameForStore: require("./edge/getNextCodenameForStore.js"),
  ...require("./templates"),
};
