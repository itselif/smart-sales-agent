const LowStockAlertManager = require("./LowStockAlertManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  LowstockalertResolvedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbResolveLowstockalert } = require("dbLayer");

class ResolveLowStockAlertManager extends LowStockAlertManager {
  constructor(request, controllerType) {
    super(request, {
      name: "resolveLowStockAlert",
      controllerType: controllerType,
      pagination: false,
      crudType: "update",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "lowStockAlert";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.lowStockAlertId = this.lowStockAlertId;
    jsonObj.resolved = this.resolved;
    jsonObj.resolvedByUserId = this.resolvedByUserId;
    jsonObj.resolvedTimestamp = this.resolvedTimestamp;
  }

  readRestParameters(request) {
    this.lowStockAlertId = request.params?.lowStockAlertId;
    this.resolved = request.body?.resolved;
    this.resolvedByUserId = request.body?.resolvedByUserId;
    this.resolvedTimestamp = request.body?.resolvedTimestamp;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.lowStockAlertId = request.mcpParams.lowStockAlertId;
    this.resolved = request.mcpParams.resolved;
    this.resolvedByUserId = request.mcpParams.resolvedByUserId;
    this.resolvedTimestamp = request.mcpParams.resolvedTimestamp;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  async fetchInstance() {
    const { getLowStockAlertById } = require("dbLayer");
    this.lowStockAlert = await getLowStockAlertById(this.lowStockAlertId);
    if (!this.lowStockAlert) {
      throw new NotFoundError("errMsg_RecordNotFound");
    }
  }

  checkParameters() {
    if (this.lowStockAlertId == null) {
      throw new BadRequestError("errMsg_lowStockAlertIdisRequired");
    }

    // ID
    if (
      this.lowStockAlertId &&
      !isValidObjectId(this.lowStockAlertId) &&
      !isValidUUID(this.lowStockAlertId)
    ) {
      throw new BadRequestError("errMsg_lowStockAlertIdisNotAValidID");
    }

    // ID
    if (
      this.resolvedByUserId &&
      !isValidObjectId(this.resolvedByUserId) &&
      !isValidUUID(this.resolvedByUserId)
    ) {
      throw new BadRequestError("errMsg_resolvedByUserIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.lowStockAlert?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbResolveLowstockalert function to update the lowstockalert and return the result to the controller
    const lowstockalert = await dbResolveLowstockalert(this);

    return lowstockalert;
  }

  async raiseEvent() {
    LowstockalertResolvedPublisher.Publish(this.output, this.session).catch(
      (err) => {
        console.log("Publisher Error in Rest Controller:", err);
      },
    );
  }

  async getRouteQuery() {
    return {
      $and: [
        { id: this.lowStockAlertId },
        { storeId: this.storeId, isActive: true },
      ],
    };

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
      resolved: this.resolved,
      resolvedByUserId: this.resolvedByUserId,
      resolvedTimestamp: this.resolvedTimestamp,
    };

    return dataClause;
  }
}

module.exports = ResolveLowStockAlertManager;
