const UserGroupMemberManager = require("./UserGroupMemberManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  GroupmemberCreatedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbCreateGroupmember } = require("dbLayer");

class CreateGroupMemberManager extends UserGroupMemberManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createGroupMember",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "userGroupMember";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.groupId = this.groupId;
    jsonObj.userId = this.userId;
    jsonObj.ownerId = this.ownerId;
  }

  readRestParameters(request) {
    this.groupId = request.body?.groupId;
    this.userId = request.body?.userId;
    this.ownerId = request.session?.userId;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.groupId = request.mcpParams.groupId;
    this.userId = request.mcpParams.userId;
    this.ownerId = request.session.userId;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.groupId == null) {
      throw new BadRequestError("errMsg_groupIdisRequired");
    }

    if (this.userId == null) {
      throw new BadRequestError("errMsg_userIdisRequired");
    }

    if (this.ownerId == null) {
      throw new BadRequestError("errMsg_ownerIdisRequired");
    }

    // ID
    if (
      this.groupId &&
      !isValidObjectId(this.groupId) &&
      !isValidUUID(this.groupId)
    ) {
      throw new BadRequestError("errMsg_groupIdisNotAValidID");
    }

    // ID
    if (
      this.userId &&
      !isValidObjectId(this.userId) &&
      !isValidUUID(this.userId)
    ) {
      throw new BadRequestError("errMsg_userIdisNotAValidID");
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

    this.isOwner = this.userGroupMember?._owner === this.session.userId;
  }

  checkAbsolute() {
    // Check if user has an absolute role to ignore all authorization validations and return
    if (this.userHasRole(this.ROLES.superAdmin)) {
      this.absoluteAuth = true;
      return true;
    }
    return false;
  }

  async checkLayer1AuthValidations() {
    //check "403" validations

    // Validation Check: routeRoleCheck
    // Check if the logged in user has [superAdmin-admin-saasAdmin] roles
    if (
      !(
        this.userHasRole(this.ROLES.superAdmin) ||
        this.userHasRole(this.ROLES.admin) ||
        this.userHasRole(this.ROLES.saasAdmin)
      )
    ) {
      throw new ForbiddenError(
        "errMsg_userShoudlHave[superAdmin-admin-saasAdmin]RoleToAccessRoute",
      );
    }
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateGroupmember function to create the groupmember and return the result to the controller
    const groupmember = await dbCreateGroupmember(this);

    return groupmember;
  }

  async raiseEvent() {
    GroupmemberCreatedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.userGroupMemberId = this.id;
    if (!this.userGroupMemberId) this.userGroupMemberId = newUUID(false);

    const dataClause = {
      id: this.userGroupMemberId,
      groupId: this.groupId,
      userId: this.userId,
      ownerId: this.ownerId,
    };

    return dataClause;
  }
}

module.exports = CreateGroupMemberManager;
