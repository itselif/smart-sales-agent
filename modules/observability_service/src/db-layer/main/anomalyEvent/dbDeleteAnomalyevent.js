const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { AnomalyEvent } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { AnomalyEventQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteAnomalyeventCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, AnomalyEvent, instanceMode);
    this.commandName = "dbDeleteAnomalyevent";
    this.nullResult = false;
    this.objectName = "anomalyEvent";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent =
      "salesai1-observability-service-dbevent-anomalyevent-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new AnomalyEventQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "anomalyEvent",
      this.session,
      this.requestId,
    );
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }
}

const dbDeleteAnomalyevent = async (input) => {
  input.id = input.anomalyEventId;
  const dbDeleteCommand = new DbDeleteAnomalyeventCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteAnomalyevent;
