const SalesManagementServiceRestController = require("./SalesManagementServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new SalesManagementServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
