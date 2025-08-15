const AnomalyEventManager = require("./AnomalyEventManager");
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
const { dbCreateAnomalyevent } = require("dbLayer");

class CreateAnomalyEventManager extends AnomalyEventManager {
  constructor(request, controllerType) {
    super(request, {
      name: "createAnomalyEvent",
      controllerType: controllerType,
      pagination: false,
      crudType: "create",
      loginRequired: true,
      hasShareToken: false,
    });

    this.dataName = "anomalyEvent";

    this.readTenantId(request);
  }

  parametersToJson(jsonObj) {
    super.parametersToJson(jsonObj);
    jsonObj.anomalyType = this.anomalyType;
    jsonObj.triggeredByUserId = this.triggeredByUserId;
    jsonObj.affectedUserId = this.affectedUserId;
    jsonObj.storeId = this.storeId;
    jsonObj.relatedEntityType = this.relatedEntityType;
    jsonObj.relatedEntityId = this.relatedEntityId;
    jsonObj.description = this.description;
    jsonObj.detectedAt = this.detectedAt;
    jsonObj.severity = this.severity;
    jsonObj.status = this.status;
    jsonObj.reviewedByUserId = this.reviewedByUserId;
  }

  readRestParameters(request) {
    this.anomalyType = request.body?.anomalyType;
    this.triggeredByUserId = request.body?.triggeredByUserId;
    this.affectedUserId = request.body?.affectedUserId;
    this.storeId = request.body?.storeId;
    this.relatedEntityType = request.body?.relatedEntityType;
    this.relatedEntityId = request.body?.relatedEntityId;
    this.description = request.body?.description;
    this.detectedAt = request.body?.detectedAt;
    this.severity = request.body?.severity;
    this.status = request.body?.status;
    this.reviewedByUserId = request.body?.reviewedByUserId;
    this.id = request.body?.id ?? request.query?.id ?? request.id;
    this.requestData = request.body;
    this.queryData = request.query ?? {};
    const url = request.url;
    this.urlPath = url.slice(1).split("/").join(".");
  }

  readMcpParameters(request) {
    this.anomalyType = request.mcpParams.anomalyType;
    this.triggeredByUserId = request.mcpParams.triggeredByUserId;
    this.affectedUserId = request.mcpParams.affectedUserId;
    this.storeId = request.mcpParams.storeId;
    this.relatedEntityType = request.mcpParams.relatedEntityType;
    this.relatedEntityId = request.mcpParams.relatedEntityId;
    this.description = request.mcpParams.description;
    this.detectedAt = request.mcpParams.detectedAt;
    this.severity = request.mcpParams.severity;
    this.status = request.mcpParams.status;
    this.reviewedByUserId = request.mcpParams.reviewedByUserId;
    this.id = request.mcpParams?.id;
    this.requestData = request.mcpParams;
  }

  async transformParameters() {}

  async setVariables() {}

  checkParameters() {
    if (this.anomalyType == null) {
      throw new BadRequestError("errMsg_anomalyTypeisRequired");
    }

    if (this.detectedAt == null) {
      throw new BadRequestError("errMsg_detectedAtisRequired");
    }

    if (this.severity == null) {
      throw new BadRequestError("errMsg_severityisRequired");
    }

    if (this.status == null) {
      throw new BadRequestError("errMsg_statusisRequired");
    }

    // ID
    if (
      this.triggeredByUserId &&
      !isValidObjectId(this.triggeredByUserId) &&
      !isValidUUID(this.triggeredByUserId)
    ) {
      throw new BadRequestError("errMsg_triggeredByUserIdisNotAValidID");
    }

    // ID
    if (
      this.affectedUserId &&
      !isValidObjectId(this.affectedUserId) &&
      !isValidUUID(this.affectedUserId)
    ) {
      throw new BadRequestError("errMsg_affectedUserIdisNotAValidID");
    }

    // ID
    if (
      this.storeId &&
      !isValidObjectId(this.storeId) &&
      !isValidUUID(this.storeId)
    ) {
      throw new BadRequestError("errMsg_storeIdisNotAValidID");
    }

    // ID
    if (
      this.reviewedByUserId &&
      !isValidObjectId(this.reviewedByUserId) &&
      !isValidUUID(this.reviewedByUserId)
    ) {
      throw new BadRequestError("errMsg_reviewedByUserIdisNotAValidID");
    }
  }

  setOwnership() {
    this.isOwner = false;
    if (!this.session || !this.session.userId) return;

    this.isOwner = this.anomalyEvent?._owner === this.session.userId;
  }

  async doBusiness() {
    // Call DbFunction
    // make an awaited call to the dbCreateAnomalyevent function to create the anomalyevent and return the result to the controller
    const anomalyevent = await dbCreateAnomalyevent(this);

    return anomalyevent;
  }

  async getDataClause() {
    const { newUUID } = require("common");

    const { hashString } = require("common");

    if (this.id) this.anomalyEventId = this.id;
    if (!this.anomalyEventId) this.anomalyEventId = newUUID(false);

    const dataClause = {
      id: this.anomalyEventId,
      anomalyType: this.anomalyType,
      triggeredByUserId: this.triggeredByUserId,
      affectedUserId: this.affectedUserId,
      storeId: this.storeId,
      relatedEntityType: this.relatedEntityType,
      relatedEntityId: this.relatedEntityId,
      description: this.description,
      detectedAt: this.detectedAt,
      severity: this.severity,
      status: this.status,
      reviewedByUserId: this.reviewedByUserId,
    };

    return dataClause;
  }
}

module.exports = CreateAnomalyEventManager;
