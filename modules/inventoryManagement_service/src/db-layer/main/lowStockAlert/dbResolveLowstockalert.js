const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { InventoryItem, InventoryMovement, LowStockAlert } = require("models");
const { Op } = require("sequelize");
const { sequelize } = require("common");

const { DBUpdateSequelizeCommand } = require("dbCommand");

const { LowStockAlertQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getLowStockAlertById = require("./utils/getLowStockAlertById");

//not
//should i ask this here? is &&false intentionally added?

class DbResolveLowstockalertCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, LowStockAlert, instanceMode);
    this.isBulk = false;
    this.commandName = "dbResolveLowstockalert";
    this.nullResult = false;
    this.objectName = "lowStockAlert";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-lowstockalert-updated";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async transposeResult() {
    // transpose dbData
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
    const dbData = await getLowStockAlertById(this.dbData.id);
    await elasticIndexer.indexData(dbData);
  }

  // ask about this should i rename the whereClause to dataClause???

  async setCalculatedFieldsAfterInstance(data) {
    const input = this.input;
  }

  buildIncludes(forWhereClause) {
    if (!this.input.getJoins) forWhereClause = true;
    const includes = [];
    return includes;
  }
}

const dbResolveLowstockalert = async (input) => {
  input.id = input.lowStockAlertId;
  const dbUpdateCommand = new DbResolveLowstockalertCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbResolveLowstockalert;
