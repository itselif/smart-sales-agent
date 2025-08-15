const RestController = require("./RestController");

class InventoryManagementServiceRestController extends RestController {
  constructor(name, routeName, req, res) {
    super(name, routeName, req, res);
    this.projectCodename = "salesai1";
    this.isMultiTenant = true;
    this.tenantName = "store";
    this.tenantId = "storeId";
    this.tenantCodename = null;
    this.isLoginApi = false;
  }

  createApiManager() {
    return null;
  }
}

module.exports = InventoryManagementServiceRestController;
