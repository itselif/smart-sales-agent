const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { ReportRequest } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const {
  getIdListOfReportFileByField,
  updateReportFileById,
  deleteReportFileById,
} = require("../reportFile");

const { ReportRequestQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteReportrequestCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, ReportRequest, instanceMode);
    this.commandName = "dbDeleteReportrequest";
    this.nullResult = false;
    this.objectName = "reportRequest";
    this.serviceLabel = "salesai-reporting-service";
    this.dbEvent = "salesai1-reporting-service-dbevent-reportrequest-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new ReportRequestQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "reportRequest",
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
      const idList_ReportFile_reportRequestId_reportRequest =
        await getIdListOfReportFileByField(
          "reportRequestId",
          this.dbData.id,
          false,
        );
      for (const itemId of idList_ReportFile_reportRequestId_reportRequest) {
        promises.push(deleteReportFileById(itemId));
      }

      // update childs

      // delete & update parents ???

      // delete and update referred parents

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result instanceof Error) {
          console.log(
            "Single Error when synching delete of ReportRequest on joined and parent objects:",
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
        "Total Error when synching delete of ReportRequest on joined and parent objects:",
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

const dbDeleteReportrequest = async (input) => {
  input.id = input.reportRequestId;
  const dbDeleteCommand = new DbDeleteReportrequestCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteReportrequest;
