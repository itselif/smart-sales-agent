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

const { DBCreateSequelizeCommand } = require("dbCommand");

const { AuditLogQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getAuditLogById = require("./utils/getAuditLogById");

class DbCreateAuditlogCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateAuditlog";
    this.objectName = "auditLog";
    this.serviceLabel = "salesai-observability-service";
    this.dbEvent = "salesai1-observability-service-dbevent-auditlog-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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
    const dbData = await getAuditLogById(this.dbData.id);
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

    let auditLog = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        storeId: this.dataClause.storeId,
        userId: this.dataClause.userId,
        createdAt: this.dataClause.createdAt,
      };

      auditLog = auditLog || (await AuditLog.findOne({ where: whereClause }));

      if (auditLog) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await auditLog.update(this.dataClause);
        updated = true;
      }
      whereClause = {
        entityType: this.dataClause.entityType,
        entityId: this.dataClause.entityId,
      };

      auditLog = auditLog || (await AuditLog.findOne({ where: whereClause }));

      if (auditLog) {
        delete this.dataClause.id;
        this.dataClause.isActive = true;
        if (!updated) await auditLog.update(this.dataClause);
        updated = true;
      }

      if (!updated && this.dataClause.id && !exists) {
        auditLog = auditLog || (await AuditLog.findByPk(this.dataClause.id));
        if (auditLog) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await auditLog.update(this.dataClause);
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
        "Error in checking unique index when creating AuditLog",
        eDetail,
      );
    }

    if (!updated && !exists) {
      auditLog = await AuditLog.create(this.dataClause);
    }

    this.dbData = auditLog.getData();
    this.input.auditLog = this.dbData;
    await this.create_childs();
  }
}

const dbCreateAuditlog = async (input) => {
  const dbCreateCommand = new DbCreateAuditlogCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateAuditlog;
