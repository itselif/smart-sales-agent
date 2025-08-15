const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { SaleTransaction } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  getIdListOfSaleTransactionHistoryByField,
  updateSaleTransactionHistoryById,
  deleteSaleTransactionHistoryById,
} = require("../saleTransactionHistory");

const {
  SaleTransactionQueryCacheInvalidator,
} = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteSaletransactionCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, SaleTransaction, instanceMode);
    this.commandName = "dbDeleteSaletransaction";
    this.nullResult = false;
    this.objectName = "saleTransaction";
    this.serviceLabel = "salesai-salesmanagement-service";
    this.dbEvent =
      "salesai1-salesmanagement-service-dbevent-saletransaction-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new SaleTransactionQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "saleTransaction",
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
      const idList_SaleTransactionHistory_transactionId_saleTransaction =
        await getIdListOfSaleTransactionHistoryByField(
          "transactionId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_SaleTransactionHistory_transactionId_saleTransaction) {
        promises.push(deleteSaleTransactionHistoryById(itemId));
      }

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of SaleTransaction on joined and parent objects:",
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
        "Total Error when synching delete of SaleTransaction on joined and parent objects:",
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

const dbDeleteSaletransaction = async (input) => {
  input.id = input.saleTransactionId;
  const dbDeleteCommand = new DbDeleteSaletransactionCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteSaletransaction;
