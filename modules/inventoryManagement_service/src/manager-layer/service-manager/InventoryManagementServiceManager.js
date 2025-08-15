const ApiManager = require("./ApiManager");

class InventoryManagementServiceManager extends ApiManager {
  constructor(request, options) {
    super(request, options);
  }

  readTenantId(request) {
    this._storeId = request.storeId;
    this.rootStoreId = "d26f6763-ee90-4f97-bd8a-c69fabdb4780";
    if (!this._storeId) this._storeId = this.rootStoreId;
    // this property will be overridden by the user parameter if the route is in saas level
    this.storeId = this._storeId;
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.storeId = this.storeId;
  }

  userHasRole(roleName) {
    if (!this.auth) return false;
    return this.auth.userHasRole(roleName);
  }
}

module.exports = InventoryManagementServiceManager;
