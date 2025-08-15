const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { InventoryItem } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  getIdListOfInventoryMovementByField,
  updateInventoryMovementById,
  deleteInventoryMovementById,
} = require("../inventoryMovement");

const { InventoryItemQueryCacheInvalidator } = require("./query-cache-classes");
const { InventoryItemEntityCache } = require("./entity-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteInventoryitemCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, InventoryItem, instanceMode);
    this.commandName = "dbDeleteInventoryitem";
    this.nullResult = false;
    this.objectName = "inventoryItem";
    this.serviceLabel = "salesai-inventorymanagement-service";
    this.dbEvent =
      "salesai1-inventorymanagement-service-dbevent-inventoryitem-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
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
    await elasticIndexer.deleteData(this.dbData.id);
  }

  //should i add this here?

  // ask about this should i rename the whereClause to dataClause???

  async transposeResult() {
    // transpose dbData
  }

  async syncJoins() {
    const promises = [];
    const dataId = this.dbData.id;
    // relationTargetKey should be used instead of id
    try {
      // delete refrring objects

      // update referring objects

      // delete childs
      const idList_InventoryMovement_inventoryItemId_inventoryItem =
        await getIdListOfInventoryMovementByField(
          "inventoryItemId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_InventoryMovement_inventoryItemId_inventoryItem) {
        promises.push(deleteInventoryMovementById(itemId));
      }

      const idList_LowStockAlert_inventoryItemId_inventoryItem =
        await getIdListOfLowStockAlertByField(
          "inventoryItemId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_LowStockAlert_inventoryItemId_inventoryItem) {
        promises.push(deleteLowStockAlertById(itemId));
      }

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of InventoryItem on joined and parent objects:",
            dataId,
            result,
          );
          hexaLogger.insertError(
            "SyncJoinError",
            { function: "syncJoins", dataId: dataId },
            "->syncJoins",
            result,
          );
        }
      }
    } catch (err) {
      console.log(
        "Total Error when synching delete of InventoryItem on joined and parent objects:",
        dataId,
        err,
      );
      hexaLogger.insertError(
        "SyncJoinsTotalError",
        { function: "syncJoins", dataId: dataId },
        "->syncJoins",
        err,
      );
    }
  }
}

const dbDeleteInventoryitem = async (input) => {
  input.id = input.inventoryItemId;
  const dbDeleteCommand = new DbDeleteInventoryitemCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteInventoryitem;
