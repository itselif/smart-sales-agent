const ObservabilityServiceRestController = require("./ObservabilityServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new ObservabilityServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
