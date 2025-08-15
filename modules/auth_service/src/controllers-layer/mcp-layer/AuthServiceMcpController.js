const McpController = require("./McpController");

class AuthServiceMcpController extends McpController {
  constructor(name, routeName, req, res) {
    super(name, routeName, req, res);
    this.projectCodename = "salesai1";
    this.isMultiTenant = true;
    this.tenantName = "store";
    this.tenantId = "storeId";
    this.tenantCodename = null;
    this.isLoginApi = true;
  }

  createApiManager() {
    return null;
  }
}

module.exports = AuthServiceMcpController;
