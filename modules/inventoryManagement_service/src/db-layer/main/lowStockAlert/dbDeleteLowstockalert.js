const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { LowStockAlert } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { LowStockAlertQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteLowstockalertCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, LowStockAlert, instanceMode);
    this.commandName = "dbDeleteLowstockalert";
    this.nullResult = false;
    this.objectName = "lowStockAlert";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-lowstockalert-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new LowStockAlertQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "lowStockAlert",
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

const dbDeleteLowstockalert = async (input) => {
  input.id = input.lowStockAlertId;
  const dbDeleteCommand = new DbDeleteLowstockalertCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteLowstockalert;
