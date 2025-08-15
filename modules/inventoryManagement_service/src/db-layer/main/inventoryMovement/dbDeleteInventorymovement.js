const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { InventoryMovement } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  InventoryMovementQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteInventorymovementCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, InventoryMovement, instanceMode);
    this.commandName = "dbDeleteInventorymovement";
    this.nullResult = false;
    this.objectName = "inventoryMovement";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-inventorymovement-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new InventoryMovementQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "inventoryMovement",
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

const dbDeleteInventorymovement = async (input) => {
  input.id = input.inventoryMovementId;
  const dbDeleteCommand = new DbDeleteInventorymovementCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteInventorymovement;
