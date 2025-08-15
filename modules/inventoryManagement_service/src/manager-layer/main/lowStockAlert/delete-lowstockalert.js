const LowStockAlertManager = require("./LowStockAlertManager");
const { isValidObjectId, isValidUUID, PaymentGateError } = require("common");
const { hexaLogger } = require("common");
const { ElasticIndexer } = require("serviceCommon");
const {
  LowstockalertDeletedPublisher,
} = require("../../route-events/publishers");

const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");
const { dbDeleteLowstockalert } = require("dbLayer");

class DeleteLowStockAlertManager extends LowStockAlertManager {
  constructor(request, controllerType) {
    super(request, {
      name: "deleteLowStockAlert",
      controllerType: controllerType,
      pagination: false,
      crudType: "delete",
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
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.lowStockAlert?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbDeleteLowstockalert function to delete the lowstockalert and return the result to the controller
    const lowstockalert = await dbDeleteLowstockalert(this);

    return lowstockalert;
  }

  async raiseEvent() {
    LowstockalertDeletedPublisher.Publish(this.output, this.session).catch(
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
}

module.exports = DeleteLowStockAlertManager;
