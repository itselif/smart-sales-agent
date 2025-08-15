const StoreManager = require("./StoreManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { StoreCreatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateStore } = require("dbLayer");

class CreateStoreManager extends StoreManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createStore",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "store";

    this.readTenantId(request);

    if (this._storeId !== "d26f6763-ee90-4f97-bd8a-c69fabdb4780") {
      throw new ForbiddenError("errMsg_thisRouteIsOpenOnlyInSaasLevel");
    }
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.avatar = this.avatar;
    jsonObj.name = this.name;
    jsonObj.codename = this.codename;
    jsonObj.fullname = this.fullname;
    jsonObj.ownerId = this.ownerId;
  }

  readRestParameters(request) {
    this.avatar = request.body?.avatar;
    this.name = request.body?.name;
    this.codename = request.codename;
    this.fullname = request.body?.fullname;
    this.ownerId = request.session?.userId;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.avatar = request.mcpParams.avatar;
    this.name = request.mcpParams.name;
    this.codename = request.mcpParams.codename;
    this.fullname = request.mcpParams.fullname;
    this.ownerId = request.session.userId;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {
    try {
      this.avatar = this.avatar
        ? this.avater
        : `https://gravatar.com/avatar/${LIB.common.md5(this.fullname)}?s=200&d=identicon`;
    } catch (err) {
      hexaLogger.error(`Error transforming parameter avatar: ${err.message}`);
      throw new BadRequestError(
        "errMsg_ErrorTransformingParameter",
        "SCRIPT_ERROR",
        {
          parameter: "avatar",
          script:
            "this.avatar ? this.avater : `https://gravatar.com/avatar/${LIB.common.md5(this.fullname)}?s=200&d=identicon`",
          error: err.message,
        },
      );
    }
  }

  async setVariables() {}

  checkParameters() {
    if (this.name == null) {
      throw new BadRequestError("errMsg_nameisRequired");
    }

    if (this.codename == null) {
      throw new BadRequestError("errMsg_codenameisRequired");
    }

    if (this.fullname == null) {
      throw new BadRequestError("errMsg_fullnameisRequired");
    }

    if (this.ownerId == null) {
      throw new BadRequestError("errMsg_ownerIdisRequired");
    }

    // ID
    if (
      this.ownerId &&
      !isValidObjectId(this.ownerId) &&
      !isValidUUID(this.ownerId)
    ) {
      throw new BadRequestError("errMsg_ownerIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.store?.ownerId === this.session.userId;
  }

  async checkLayer1AuthValidations() {
    //check "403" validations

    // Validation Check: routeRoleCheck
    // Check if the logged in user has [superAdmin-saasAdmin] roles
    if (
      !(
        this.userHasRole(this.ROLES.superAdmin) ||
        this.userHasRole(this.ROLES.saasAdmin)
      )
    ) {
      throw new ForbiddenError(
        "errMsg_userShoudlHave[superAdmin-saasAdmin]RoleToAccessRoute",
      );
    }
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateStore function to create the store and return the result to the controller
    const store = await dbCreateStore(this);

    return store;
  }

  async raiseEvent() {
    StoreCreatedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getNextCodename(name) {
    const { getNextCodenameForStore } = require("dbLayer");
    return await getNextCodenameForStore(name?.toLowerCase());
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.storeId = this.id;
    if (!this.storeId) this.storeId = newUUID(false);

    const dataClause = {
      id: this.storeId,
      name: this.name,
      codename: this.codename,
      fullname: this.fullname,
      avatar: this.avatar,
      ownerId: this.ownerId,
    };

    dataClause.codename = dataClause.name
      ? await this.getNextCodename(dataClause.name)
      : undefined;

    return dataClause;
  }
}

module.exports = CreateStoreManager;
