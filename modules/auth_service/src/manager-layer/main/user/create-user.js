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
const { dbCreateUser } = require("dbLayer");

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
    jsonObj.avatar = this.avatar;
    jsonObj.email = this.email;
    jsonObj.password = this.password;
    jsonObj.fullname = this.fullname;
  }

  readRestParameters(request) {
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
    this.avatar = request.inputData.avatar;
    this.email = request.inputData.email;
    this.password = request.inputData.password;
    this.fullname = request.inputData.fullname;
    this.id = request.inputData?.id;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
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

  async setVariables() {}

  checkParameters() {
    if (this.email == null) {
      throw new BadRequestError("errMsg_emailisRequired");
    }

    if (this.password == null) {
      throw new BadRequestError("errMsg_passwordisRequired");
    }

    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.user?.id === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateUser function to create the user and return the result to the controller
    const user = await dbCreateUser(this);

    return user;
  }

  async raiseEvent() {
    UserCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
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
    };

    return dataClause;
  }
}

module.exports = CreateUserManager;
