const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { UserCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { dbScriptCreateUser } = require("dbLayer");

class CreateUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createUser",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "user";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userId = this.userId;
    jsonObj.avatar = this.avatar;
    jsonObj.email = this.email;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
  }

  readRestParameters(request) {
    this.userId = request.params?.userId;
    this.avatar = request.body?.avatar;
    this.email = request.body?.email;
    this.password = request.body?.password;
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
    this.email = request.inputData.email;
    this.password = request.inputData.password;
    this.fullname = request.inputData.fullname;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.avatar = request.mcpParams.avatar;
    this.email = request.mcpParams.email;
    this.password = request.mcpParams.password;
    this.fullname = request.mcpParams.fullname;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {
    try {
      this.avatar =
        this.socialProfile?.avatar ??
        (this.avatar
          ? this.avatar
          : `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? "nullValue")}?s=200&d=identicon`);
    } catch (err) {
      hexaLogger.error(`Error transforming parameter avatar: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "this.socialProfile?.avatar ?? (this.avatar ? this.avatar : `https://gravatar.com/avatar/${LIB.common.md5(this.email ?? 'nullValue')}?s=200&d=identicon`)",
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

    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }

    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
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

  checkAbsolute() {
    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole(this.ROLES.superAdmin)) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async doBusiness() {
    const user = await dbScriptCreateUser(this);
    return user;
  }

  async raiseEvent() {
    UserCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  // Work Flow

  // Action Store
}

module.exports = CreateUserManager;
