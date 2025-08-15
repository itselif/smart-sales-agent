const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { UserroleUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateUserrole } = require("dbLayer");

class UpdateUserRoleManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateUserRole",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "user";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.roleId = this.roleId;
  }

  readRestParameters(request) {
    this.userId = request.params?.userId;
    this.roleId = request.body?.roleId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.userId = request.inputData.userId;
    this.roleId = request.inputData.roleId;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.roleId = request.mcpParams.roleId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getUserById } = require("dbLayer");
    this.user = await getUserById(this.userId);
    if (!this.user) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (this.roleId == null) {
      throw new BadRequestError("errMsg_roleIdisRequired");
    }

    // ID
    if (
      this.userId &&
      !isValidObjectId(this.userId) &&
      !isValidUUID(this.userId)
    ) {
      throw new BadRequestError("errMsg_userIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.user?.id === this.session.userId;
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
    // Check if the logged in user has [superAdmin-tenantAdmin] roles
    if (
      !(
        this.userHasRole(this.ROLES.superAdmin) ||
        this.userHasRole(this.ROLES.tenantAdmin)
      )
    ) {
      throw new ForbiddenError(
        "errMsg_userShoudlHave[superAdmin-tenantAdmin]RoleToAccessRoute",
      );
    }
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateUserrole function to update the userrole and return the result to the controller
    const userrole = await dbUpdateUserrole(this);

    return userrole;
  }

  async checkSessionInvalidates() {
    /*  
 await invalidateUserSessions(this.user.id);*/
  }

  async invalidateUserSessions(userId) {
    const userAuthUpdateKey = "hexauserauthupdate:" + userId;
    await setRedisData(userAuthUpdateKey, "true");
  }

  async raiseEvent() {
    UserroleUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getRouteQuery() {
    return {
      $and: [{ id: this.userId }, { storeId: this.storeId, isActive: true }],
    };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      roleId: this.roleId,
    };

    return dataClause;
  }
}

module.exports = UpdateUserRoleManager;
