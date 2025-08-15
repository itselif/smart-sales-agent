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

const { DBCreateSequelizeCommand } = require("dbCommand");

const {
  InventoryMovementQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getInventoryMovementById = require("./utils/getInventoryMovementById");

class DbCreateInventorymovementCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateInventorymovement";
    this.objectName = "inventoryMovement";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-inventorymovement-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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
    const dbData = await getInventoryMovementById(this.dbData.id);
    await elasticIndexer.indexData(dbData);
  }

  // should i add hooksDbLayer here?

  // ask about this should i rename the whereClause to dataClause???

  async create_childs() {}

  async transposeResult() {
    // transpose dbData
  }

  async runDbCommand() {
    await super.runDbCommand();

    let inventoryMovement = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        inventoryItemId: this.dataClause.inventoryItemId,
        movementTimestamp: this.dataClause.movementTimestamp,
      };

      inventoryMovement =
        inventoryMovement ||
        (await InventoryMovement.findOne({ where: whereClause }));

      if (inventoryMovement) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" +
            "inventoryItemId-movementTimestamp",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        inventoryMovement =
          inventoryMovement ||
          (await InventoryMovement.findByPk(this.dataClause.id));
        if (inventoryMovement) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await inventoryMovement.update(this.dataClause);
          updated = true;
        }
      }
    } catch (error) {
      const eDetail = {
        whereClause: this.normalizeSequalizeOps(whereClause),
        dataClause: this.dataClause,
        errorStack: error.stack,
        checkoutResult: this.input.checkoutResult,
      };
      throw new HttpServerError(
        "Error in checking unique index when creating InventoryMovement",
        eDetail,
      );
    }

    if (!updated && !exists) {
      inventoryMovement = await InventoryMovement.create(this.dataClause);
    }

    this.dbData = inventoryMovement.getData();
    this.input.inventoryMovement = this.dbData;
    await this.create_childs();
  }
}

const dbCreateInventorymovement = async (input) => {
  const dbCreateCommand = new DbCreateInventorymovementCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateInventorymovement;
