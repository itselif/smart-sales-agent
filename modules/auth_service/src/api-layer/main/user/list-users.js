const UserManager = require("./UserManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { UsersListedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { dbScriptListUsers } = require("dbLayer");

class ListUsersManager extends UserManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listUsers",
      controllerType: controllerType,
      pagination: false,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "users";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
  }

  readRestParameters(request) {
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readGrpcParameters(request) {
    this.requestData = request.inputData;
  }

  readMcpParameters(request) {
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  // where clause methods

  async getRouteQuery() {
    return { $and: [{ storeId: this.storeId, isActive: true }] };

    // handle permission filter later
  }

  async buildWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }

  async fetchInstance() {
    const { getUserByQuery } = require("dbLayer");
    this.user = await getUserByQuery(this.whereClause);
    if (!this.user) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {}

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.users?.id === this.session.userId;
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
    const users = await dbScriptListUsers(this);
    return users;
  }

  async raiseEvent() {
    UsersListedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  // Work Flow

  async afterMainListOperation() {
    try {
      this.userData = await this.getUsersData();
    } catch (err) {
      console.log("getUsersData Action Error:", err.message);
      throw err;
    }

    try {
      this.foundAddresses = await this.setUserAddresses();
    } catch (err) {
      console.log("setUserAddresses Action Error:", err.message);
      throw err;
    }
  }

  // Action Store

  async getUsersData() {
    // Loop Action
    const loopList = this.users;
    let executed = 0;

    const promises = [];
    const returnNames = [];
    const items = [];
    for (const user of loopList) {
      promises.push(this.getUserStore(user));
      returnNames.push("userStore");
      items.push(user);
      executed++;
    }

    const results = await Promise.all(promises);
    for (const [idx, result] of results.entries()) {
      const contextItem = items[idx];
      const prop = returnNames[idx];
      contextItem[prop] = result;
    }

    return executed;
  }

  async getUserStore(user) {
    // Fetch Object on childObject store

    const userQuery = {
      $and: [
        {
          id: user.storeId,
          isActive: true,
        },
        { isActive: true },
      ],
    };
    const { convertUserQueryToSequelizeQuery } = require("common");
    const scriptQuery = convertUserQueryToSequelizeQuery(userQuery);

    // get object from db
    const data = await getStoreByQuery(scriptQuery);

    return data
      ? {
          fullname: data["fullname"],
        }
      : null;
  }

  async setUserAddresses() {
    // Collate Lists Action
    const sourceList = this.addresses;
    const targetList = this.users;

    let foundTargets = 0;
    for (const targetItem of targetList) {
      targetItem.userAddresses = sourceList.filter(
        (sourceItem) => sourceItem.userId === targetItem.id,
      );
      if (targetItem.userAddresses.length) foundTargets++;
    }

    return foundTargets;
  }
}

module.exports = ListUsersManager;
