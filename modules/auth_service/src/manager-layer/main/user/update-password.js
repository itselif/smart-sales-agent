const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { PasswordUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdatePassword } = require("dbLayer");

class UpdatePasswordManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updatePassword",
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
    jsonObj.oldPassword = this.oldPassword;
    jsonObj.newPassword = this.newPassword;
  }

  readRestParameters(request) {
    this.userId = request.params?.userId;
    this.oldPassword = request.body?.oldPassword;
    this.newPassword = request.body?.newPassword;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.userId = request.inputData.userId;
    this.oldPassword = request.inputData.oldPassword;
    this.newPassword = request.inputData.newPassword;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.oldPassword = request.mcpParams.oldPassword;
    this.newPassword = request.mcpParams.newPassword;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {
    try {
      this.oldPassword = this.oldPassword
        ? this.hashString(this.oldPassword)
        : null;
    } catch (err) {
      hexaLogger.error(
        `Error transforming parameter oldPassword: ${err.message}`,
      );
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "oldPassword",
          script: "this.oldPassword ? this.hashString(this.oldPassword) : null",
          error: err.message,
        },
      );
    }
    try {
      this.newPassword = this.newPassword
        ? this.hashString(this.newPassword)
        : null;
    } catch (err) {
      hexaLogger.error(
        `Error transforming parameter newPassword: ${err.message}`,
      );
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "newPassword",
          script: "this.newPassword ? this.hashString(this.newPassword) : null",
          error: err.message,
        },
      );
    }
  }

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

    if (this.oldPassword == null) {
      throw new BadRequestError("errMsg_oldPasswordisRequired");
    }

    if (this.newPassword == null) {
      throw new BadRequestError("errMsg_newPasswordisRequired");
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
    if (
      this.userHasRole(this.ROLES.superAdmin) ||
      this.userHasRole(this.ROLES.tenantAdmin)
    ) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async checkLayer3AuthValidations() {
    // check ownership of the record agianst the session user
    if (!this.isOwner) {
      throw new ForbiddenError("errMsg_userCanBeAccessedByOwner");
    }

    //check "403" validations

    // Validation Check: oldPassword
    // Check if the current password mathces the old password. It is done after the instance is fetched.
    if (!this.hashCompare(this.user.password, this.oldPassword)) {
      throw new ForbiddenError("errMsg_TheOldPasswordDoesNotMatch");
    }
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdatePassword function to update the password and return the result to the controller
    const password = await dbUpdatePassword(this);

    return password;
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
    PasswordUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
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
      // password parameter is closed to update in inputLayer
      // include it in dbLayer unless you are sure
      password: this.newPassword,
    };

    return dataClause;
  }
}

module.exports = UpdatePasswordManager;
