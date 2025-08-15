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

const { InventoryItemQueryCacheInvalidator } = require("./query-cache-classes");
const { InventoryItemEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getInventoryItemById = require("./utils/getInventoryItemById");

//not
//should i ask this here? is &&false intentionally added?

class DbUpdateInventoryitemCommand extends DBUpdateSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    input.isBulk = false;
    input.updateEach = false;
    super(input, InventoryItem, instanceMode);
    this.isBulk = false;
    this.commandName = "dbUpdateInventoryitem";
    this.nullResult = false;
    this.objectName = "inventoryItem";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.joinedCriteria = false;
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-inventoryitem-updated";
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
    this.queryCacheInvalidator = new InventoryItemQueryCacheInvalidator();
  }

  createEntityCacher() {
    super.createEntityCacher();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "inventoryItem",
      this.session,
      this.requestId,
    );
    const dbData = await getInventoryItemById(this.dbData.id);
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

const dbUpdateInventoryitem = async (input) => {
  input.id = input.inventoryItemId;
  const dbUpdateCommand = new DbUpdateInventoryitemCommand(input);
  return await dbUpdateCommand.execute();
};

module.exports = dbUpdateInventoryitem;
