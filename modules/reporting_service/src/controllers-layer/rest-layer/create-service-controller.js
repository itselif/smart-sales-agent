const ReportingServiceRestController = require("./ReportingServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new ReportingServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
