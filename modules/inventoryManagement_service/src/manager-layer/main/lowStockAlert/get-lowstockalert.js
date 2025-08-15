const LowStockAlertManager = require("./LowStockAlertManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbGetLowstockalert } = require("dbLayer");

class GetLowStockAlertManager extends LowStockAlertManager {
  constructor(request, controllerType) {
    super(request, {
      name: "getLowStockAlert",
      controllerType: controllerType,
      pagination: false,
      crudType: "get",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "lowStockAlert";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.lowStockAlertId = this.lowStockAlertId;
  }

  readRestParameters(request) {
    this.lowStockAlertId = request.params?.lowStockAlertId;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.lowStockAlertId = request.mcpParams.lowStockAlertId;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

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
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.lowStockAlert?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbGetLowstockalert function to get the lowstockalert and return the result to the controller
    const lowstockalert = await dbGetLowstockalert(this);

    return lowstockalert;
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
}

module.exports = GetLowStockAlertManager;
