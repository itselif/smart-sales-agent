const StoreManagementServiceRestController = require("./StoreManagementServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new StoreManagementServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
