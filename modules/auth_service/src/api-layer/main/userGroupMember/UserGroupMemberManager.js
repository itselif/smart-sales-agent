const { HttpServerError, HttpError, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const AuthServiceManager = require("../../service-manager/AuthServiceManager");

/* Base Class For the Crud Routes Of DbObject UserGroupMember */
class UserGroupMemberManager extends AuthServiceManager {
  constructor(request, options) {
    super(request, options);
    this.objectName = "userGroupMember";
    this.modelName = "UserGroupMember";
  }

  toJSON() {
    const jsonObj = super.toJSON();

    return jsonObj;
  }
}

module.exports = UserGroupMemberManager;
