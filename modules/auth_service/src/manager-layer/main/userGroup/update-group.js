const UserGroupManager = require("./UserGroupManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const { GroupUpdatedPublisher } = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbUpdateGroup } = require("dbLayer");

class UpdateGroupManager extends UserGroupManager {
  constructor(request, controllerType) {
    super(request, {
      name: "updateGroup",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroup";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userGroupId = this.userGroupId;
    jsonObj.groupName = this.groupName;
    jsonObj.avatar = this.avatar;
  }

  readRestParameters(request) {
    this.userGroupId = request.params?.userGroupId;
    this.groupName = request.body?.groupName;
    this.avatar = request.body?.avatar;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userGroupId = request.mcpParams.userGroupId;
    this.groupName = request.mcpParams.groupName;
    this.avatar = request.mcpParams.avatar;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getUserGroupById } = require("dbLayer");
    this.userGroup = await getUserGroupById(this.userGroupId);
    if (!this.userGroup) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

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

  checkAbsolute() {
    // Check if user has an absolute role to ignore all authorization validations and return
    if (
      this.userHasRole(this.ROLES.superAdmin) ||
      this.userHasRole(this.ROLES.admin) ||
      this.userHasRole(this.ROLES.saasAdmin)
    ) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbUpdateGroup function to update the group and return the result to the controller
    const group = await dbUpdateGroup(this);

    return group;
  }

  async raiseEvent() {
    GroupUpdatedPublisher.Publish(this.output, this.session).catch((err) => {
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

  async getDataClause() {
    const { hashString } = require("common");

    const dataClause = {
      groupName: this.groupName,
      avatar: hashString(this.avatar),
    };

    return dataClause;
  }
}

module.exports = UpdateGroupManager;
