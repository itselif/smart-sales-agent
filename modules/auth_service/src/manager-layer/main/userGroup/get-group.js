const UserGroupManager = require("./UserGroupManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { GroupRetrivedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbGetGroup } = require("dbLayer");

class GetGroupManager extends UserGroupManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getGroup",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroup";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userGroupId = this.userGroupId;
  }

  readRestParameters(request) {
    this.userGroupId = request.params?.userGroupId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userGroupId = request.mcpParams.userGroupId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.userGroupId == null) {
      throw new BadRequestError("errMsg_userGroupIdisRequired");
    }

    // ID
    if (
      this.userGroupId &&
      !isValidObjectId(this.userGroupId) &&
      !isValidUUID(this.userGroupId)
    ) {
      throw new BadRequestError("errMsg_userGroupIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.userGroup?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetGroup function to get the group and return the result to the controller
    const group = await dbGetGroup(this);

    return group;
  }

  async raiseEvent() {
    GroupRetrivedPublisher.Publish(this.output, this.session).catch((err) => {
      console.log("Publisher Error in Rest Controller:", err);
    });
  }

  async getRouteQuery() {
    return { $and: [{ id: this.userGroupId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = GetGroupManager;
