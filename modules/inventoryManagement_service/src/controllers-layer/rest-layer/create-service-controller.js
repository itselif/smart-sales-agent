const InventoryManagementServiceRestController = require("./InventoryManagementServiceRestController");

module.exports = (name, routeName, req, res) => {
  const restController = new InventoryManagementServiceRestController(
    name,
    routeName,
    req,
    res,
  );
  return restController;
};
