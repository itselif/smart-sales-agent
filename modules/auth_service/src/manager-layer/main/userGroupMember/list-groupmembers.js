const UserGroupMemberManager = require("./UserGroupMemberManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  GroupmembersListedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbListGroupmembers } = require("dbLayer");

class ListGroupMembersManager extends UserGroupMemberManager {
  constructor(request, controllerType) {
    super(request, {
      name: "listGroupMembers",
      controllerType: controllerType,
      pagination: false,
      crudType: "getList",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroupMembers";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.groupId = this.groupId;
  }

  readRestParameters(request) {
    this.groupId = request.query?.groupId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.groupId = request.mcpParams.groupId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.groupId == null) {
      throw new BadRequestError("errMsg_groupIdisRequired");
    }

    // ID
    if (
      this.groupId &&
      !isValidObjectId(this.groupId) &&
      !isValidUUID(this.groupId)
    ) {
      throw new BadRequestError("errMsg_groupIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.userGroupMembers?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbListGroupmembers function to getList the groupmembers and return the result to the controller
    const groupmembers = await dbListGroupmembers(this);

    return groupmembers;
  }

  async raiseEvent() {
    GroupmembersListedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ groupId: { $eq: this.groupId } }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = ListGroupMembersManager;
