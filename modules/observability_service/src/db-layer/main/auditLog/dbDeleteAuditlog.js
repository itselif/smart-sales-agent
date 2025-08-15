const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { AuditLog } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { AuditLogQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteAuditlogCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, AuditLog, instanceMode);
    this.commandName = "dbDeleteAuditlog";
    this.nullResult = false;
    this.objectName = "auditLog";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent = "salesai1-observability-service-dbevent-auditlog-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new AuditLogQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "auditLog",
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

const dbDeleteAuditlog = async (input) => {
  input.id = input.auditLogId;
  const dbDeleteCommand = new DbDeleteAuditlogCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteAuditlog;
