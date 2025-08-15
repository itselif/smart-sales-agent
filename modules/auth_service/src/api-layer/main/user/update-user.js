const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { UserUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { dbScriptUpdateUser } = require("dbLayer");

class UpdateUserManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateUser",
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
    jsonObj.fullname = this.fullname;
    jsonObj.avatar = this.avatar;
  }

  readRestParameters(request) {
    this.userId = request.params?.userId;
    this.fullname = request.body?.fullname;
    this.avatar = request.body?.avatar;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.userId = request.inputData.userId;
    this.fullname = request.inputData.fullname;
    this.avatar = request.inputData.avatar;
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.userId = request.mcpParams.userId;
    this.fullname = request.mcpParams.fullname;
    this.avatar = request.mcpParams.avatar;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return {
      $and: [{ id: this.userId }, { storeId: this.storeId, isActive: true }],
    };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  // data clause methods

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      // password parameter is closed to update in inputLayer
      // include it in dbLayer unless you are sure
      password: hashString(this.password),
      fullname: this.fullname,
      avatar: this.avatar,
      // emailVerified parameter is closed to update in inputLayer
      // include it in dbLayer unless you are sure
      emailVerified: this.emailVerified,
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
    const user = await dbScriptUpdateUser(this);
    return user;
  }

  async raiseEvent() {
    UserUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  // Work Flow

  // Action Store
}

module.exports = UpdateUserManager;
