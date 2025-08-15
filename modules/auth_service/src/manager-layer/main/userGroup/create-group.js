const UserGroupManager = require("./UserGroupManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { GroupCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateGroup } = require("dbLayer");

class CreateGroupManager extends UserGroupManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createGroup",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroup";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.avatar = this.avatar;
    jsonObj.groupName = this.groupName;
  }

  readRestParameters(request) {
    this.avatar = request.body?.avatar;
    this.groupName = request.body?.groupName;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.avatar = request.mcpParams.avatar;
    this.groupName = request.mcpParams.groupName;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {
    try {
      this.avatar = this.avatar
        ? this.avatar
        : `https://gravatar.com/avatar/${LIB.common.md5(this.groupName ?? "nullValue")}?s=200&d=identicon`;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter avatar: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "this.avatar ? this.avatar : `https://gravatar.com/avatar/${LIB.common.md5(this.groupName ?? 'nullValue')}?s=200&d=identicon`",
          error: err.message,
        },
      );
    }
  }

  async setVariables() {}

  checkParameters() {
    if (this.groupName == null) {
      throw new BadRequestError("errMsg_groupNameisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.userGroup?._owner === this.session.userId;
  }

  checkAbsolute() {
    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole(this.ROLES.superAdmin)) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async checkLayer1AuthValidations() {
    //check "403" validations

    // Validation Check: routeRoleCheck
    // Check if the logged in user has [superAdmin-admin-saasAdmin] roles
    if (
      !(
        this.userHasRole(this.ROLES.superAdmin) ||
        this.userHasRole(this.ROLES.admin) ||
        this.userHasRole(this.ROLES.saasAdmin)
      )
    ) {
      throw new ForbiddenError(
        "errMsg_userShoudlHave[superAdmin-admin-saasAdmin]RoleToAccessRoute",
      );
    }
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateGroup function to create the group and return the result to the controller
    const group = await dbCreateGroup(this);

    return group;
  }

  async raiseEvent() {
    GroupCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userGroupId = this.id;
    if (!this.userGroupId) this.userGroupId = newUUID(false);

    const dataClause = {
      id: this.userGroupId,
      groupName: this.groupName,
      avatar: hashString(this.avatar),
    };

    return dataClause;
  }
}

module.exports = CreateGroupManager;
