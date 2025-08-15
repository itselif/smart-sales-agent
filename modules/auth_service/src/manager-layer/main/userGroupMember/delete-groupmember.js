const UserGroupMemberManager = require("./UserGroupMemberManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  GroupmemberDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteGroupmember } = require("dbLayer");

class DeleteGroupMemberManager extends UserGroupMemberManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteGroupMember",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroupMember";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.userGroupMemberId = this.userGroupMemberId;
  }

  readRestParameters(request) {
    this.userGroupMemberId = request.params?.userGroupMemberId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.userGroupMemberId = request.mcpParams.userGroupMemberId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getUserGroupMemberById } = require("dbLayer");
    this.userGroupMember = await getUserGroupMemberById(this.userGroupMemberId);
    if (!this.userGroupMember) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.userGroupMemberId == null) {
      throw new BadRequestError("errMsg_userGroupMemberIdisRequired");
    }

    // ID
    if (
      this.userGroupMemberId &&
      !isValidObjectId(this.userGroupMemberId) &&
      !isValidUUID(this.userGroupMemberId)
    ) {
      throw new BadRequestError("errMsg_userGroupMemberIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.userGroupMember?._owner === this.session.userId;
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
    // make an awaited call to the dbDeleteGroupmember function to delete the groupmember and return the result to the controller
    const groupmember = await dbDeleteGroupmember(this);

    return groupmember;
  }

  async raiseEvent() {
    GroupmemberDeletedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return { $and: [{ id: this.userGroupMemberId }, { isActive: true }] };

    // handle permission filter later
  }

  async getWhereClause() {
    const { convertUserQueryToSequelizeQuery } = require("common");

    const routeQuery = await this.getRouteQuery();

    return convertUserQueryToSequelizeQuery(routeQuery);
  }
}

module.exports = DeleteGroupMemberManager;
