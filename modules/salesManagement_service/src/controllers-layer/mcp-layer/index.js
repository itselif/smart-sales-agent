const mainMcpRouters = require("./main");
const sessionRouter = require("./session-router");
module.exports = (headers) => {
  return {
    ...mainMcpRouters(headers),
    SalesManagementServiceMcpController: require("./SalesManagementServiceMcpController"),
    ...sessionRouter,
  };
};
