const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  TenantuserRegisterredPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbRegisterTenantuser } = require("dbLayer");

const { getRedisData } = require("common");

class RegisterTenantUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "registerTenantUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: false,
      hasShareToken: false,
    });

    this.dataName = "user";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.socialCode = this.socialCode;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
    jsonObj.email = this.email;
    jsonObj.avatar = this.avatar;
  }

  readRestParameters(request) {
    this.socialCode = request.body?.socialCode;
    this.password = request.body?.password;
    this.fullname = request.body?.fullname;
    this.email = request.body?.email;
    this.avatar = request.body?.avatar;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.socialCode = request.inputData.socialCode;
    this.password = request.inputData.password;
    this.fullname = request.inputData.fullname;
    this.email = request.inputData.email;
    this.avatar = request.inputData.avatar;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.socialCode = request.mcpParams.socialCode;
    this.password = request.mcpParams.password;
    this.fullname = request.mcpParams.fullname;
    this.email = request.mcpParams.email;
    this.avatar = request.mcpParams.avatar;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async readRedisParameters() {
    this.socialProfile = this.socialCode
      ? await getRedisData(this.socialCode)
      : undefined;
  }

  async transformParameters() {
    try {
      this.password = this.socialProfile
        ? (this.password ?? LIB.common.randomCode())
        : this.password;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter password: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "password",
          script:
            "this.socialProfile ? this.password ?? LIB.common.randomCode() : this.password",
          error: err.message,
        },
      );
    }
    try {
      this.fullname = this.socialProfile?.fullname ?? this.fullname;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter fullname: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "fullname",
          script: "this.socialProfile?.fullname ?? this.fullname",
          error: err.message,
        },
      );
    }
    try {
      this.email = this.socialProfile?.email ?? this.email;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter email: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "email",
          script: "this.socialProfile?.email ?? this.email",
          error: err.message,
        },
      );
    }
  }

  async setVariables() {}

  checkParameters() {
    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
    }

    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
    }

    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.user?.id === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbRegisterTenantuser function to create the tenantuser and return the result to the controller
    const tenantuser = await dbRegisterTenantuser(this);

    return tenantuser;
  }

  async raiseEvent() {
    TenantuserRegisterredPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userId = this.id;
    if (!this.userId) this.userId = newUUID(false);

    const dataClause = {
      id: this.userId,
      email: this.email,
      password: hashString(this.password),
      fullname: this.fullname,
      avatar: this.avatar,
      storeId: this.storeId,
      emailVerified: this.socialProfile?.emailVerified ?? false,
      roleId: this.socialProfile?.roleId ?? "tenantUser",
    };

    return dataClause;
  }
}

module.exports = RegisterTenantUserManager;
