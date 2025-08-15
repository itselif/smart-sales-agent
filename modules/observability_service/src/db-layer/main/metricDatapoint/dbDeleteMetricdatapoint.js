const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { MetricDatapoint } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  MetricDatapointQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteMetricdatapointCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, MetricDatapoint, instanceMode);
    this.commandName = "dbDeleteMetricdatapoint";
    this.nullResult = false;
    this.objectName = "metricDatapoint";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent =
      "salesai1-observability-service-dbevent-metricdatapoint-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new MetricDatapointQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "metricDatapoint",
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

const dbDeleteMetricdatapoint = async (input) => {
  input.id = input.metricDatapointId;
  const dbDeleteCommand = new DbDeleteMetricdatapointCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteMetricdatapoint;
