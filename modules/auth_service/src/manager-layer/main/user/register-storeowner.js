const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  StoreownerRegisterredPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbRegisterStoreowner } = require("dbLayer");

const { getRedisData } = require("common");

class RegisterStoreOwnerManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "registerStoreOwner",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: false,
      hasShareToken: false,
    });

    this.dataName = "user";

    this.readTenantId(request);

    if (this._storeId !== "d26f6763-ee90-4f97-bd8a-c69fabdb4780") {
      throw new ForbiddenError("errMsg_thisRouteIsOpenOnlyInSaasLevel");
    }
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.avatar = this.avatar;
    jsonObj.socialCode = this.socialCode;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
    jsonObj.email = this.email;
  }

  readRestParameters(request) {
    this.avatar = request.body?.avatar;
    this.socialCode = request.body?.socialCode;
    this.password = request.body?.password;
    this.fullname = request.body?.fullname;
    this.email = request.body?.email;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.avatar = request.inputData.avatar;
    this.socialCode = request.inputData.socialCode;
    this.password = request.inputData.password;
    this.fullname = request.inputData.fullname;
    this.email = request.inputData.email;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.avatar = request.mcpParams.avatar;
    this.socialCode = request.mcpParams.socialCode;
    this.password = request.mcpParams.password;
    this.fullname = request.mcpParams.fullname;
    this.email = request.mcpParams.email;
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
      this.avatar = this.avatar
        ? `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? "nullValue")}?s=200&d=identicon`
        : null;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter avatar: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "this.avatar ? `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? 'nullValue')}?s=200&d=identicon` : null",
          error: err.message,
        },
      );
    }
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
    // make an awaited call to the dbRegisterStoreowner function to create the storeowner and return the result to the controller
    const storeowner = await dbRegisterStoreowner(this);

    return storeowner;
  }

  async raiseEvent() {
    StoreownerRegisterredPublisher.Publish(this.output, this.session).catch(
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
    };

    return dataClause;
  }

  async executeAggregatedCruds() {
    this.userStore = await this.executeAggregatedCrudUserStore();
    this.updateUserStoreId =
      await this.executeAggregatedCrudUpdateUserStoreId();
  }

  async executeAggregatedCrudUserStore() {
    // Aggregated Create Operation on Store
    const { createStore } = require("dbLayer");
    const params = {
      name: this.store.name,
      fullname: this.store.fullname,
      avatar: this.store.avatar
        ? this.store.avatar
        : `https://gravatar.com/avatar/${LIB.common.md5(this.fullname)}?s=200&d=identicon`,
      ownerId: this.user.id,
    };
    return await createStore(params);
  }

  async executeAggregatedCrudUpdateUserStoreId() {
    // Aggregated Update Operation on User
    const { updateUserByQuery } = require("dbLayer");
    const params = {
      roleId: "tenantAdmin",
      storeId: this.userStore.id,
    };
    const userQuery = { id: this.user.id };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);
    return await updateUserByQuery(params, query);
  }
}

module.exports = RegisterStoreOwnerManager;
