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

const { dbScriptRegisterStoreowner } = require("dbLayer");

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
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.avatar = this.avatar;
    jsonObj.socialCode = this.socialCode;
    jsonObj.password = this.password;
    jsonObj.email = this.email;
    jsonObj.fullname = this.fullname;
  }

  readRestParameters(request) {
    this.userId = request.params?.userId;
    this.avatar = request.body?.avatar;
    this.socialCode = request.body?.socialCode;
    this.password = request.body?.password;
    this.email = request.body?.email;
    this.fullname = request.body?.fullname;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.userId = request.inputData.userId;
    this.avatar = request.inputData.avatar;
    this.socialCode = request.inputData.socialCode;
    this.password = request.inputData.password;
    this.email = request.inputData.email;
    this.fullname = request.inputData.fullname;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.avatar = request.mcpParams.avatar;
    this.socialCode = request.mcpParams.socialCode;
    this.password = request.mcpParams.password;
    this.email = request.mcpParams.email;
    this.fullname = request.mcpParams.fullname;
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
  }

  // data clause methods

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userId = this.id;
    if (!this.userId) this.userId = newUUID(false);

    const dataClause = {
      userId: this.userId,
      storeId: this.storeId,
      email: this.email,
      password: hashString(this.password),
      fullname: this.fullname,
      avatar: this.avatar,
      emailVerified: this.socialProfile?.emailVerified ?? false,
      isActive: true,
    };

    return dataClause;
  }

  async fetchInstance() {
    const { getUserByQuery } = require("dbLayer");
    this.user = await getUserByQuery(this.whereClause);
    if (!this.user) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
    }

    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }

    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
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

  async doBusiness() {
    const storeowner = await dbScriptRegisterStoreowner(this);
    return storeowner;
  }

  async raiseEvent() {
    StoreownerRegisterredPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  // Work Flow

  async afterMainCreateOperation() {
    try {
      if (this.store != null) this.userStore = await this.createUserStore();
    } catch (err) {
      console.log("createUserStore Action Error:", err.message);
      throw err;
    }

    try {
      if (this.userStore != null)
        this.storeOwner = await this.updateStoreOwner();
    } catch (err) {
      console.log("updateStoreOwner Action Error:", err.message);
      throw err;
    }
  }

  async afterSendResponse() {
    try {
      if (this.storeOwner != null)
        this.storeOwnerSms = await this.sendSmsToStoreOwner();
    } catch (err) {
      console.log("sendSmsToStoreOwner Action Error:", err.message);
      throw err;
    }
  }

  // Action Store

  async createUserStore() {
    // Aggregated Create Operation on childObject Store

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

  async updateStoreOwner() {
    // Aggregated Update Operation on childObject User

    const params = {
      roleId: "tenantAdmin",
      storeId: this.userStore.id,
    };

    const userQuery = { id: this.user.id };

    const { convertUserQueryToSequelizeQuery } = require("common");
    const query = convertUserQueryToSequelizeQuery(userQuery);

    return await updateUserByQuery(params, query);
  }

  async sendSmsToStoreOwner() {
    // Integration Action for awsSns

    const input = {
      phoneNumber: this.storeOwner.mobile,
      message: `Welcome to the application`,
    };

    const awsSnsClient = await getIntegrationClient(awsSns);
    return await awsSnsClient.publishSms(input);
  }
}

module.exports = RegisterStoreOwnerManager;
