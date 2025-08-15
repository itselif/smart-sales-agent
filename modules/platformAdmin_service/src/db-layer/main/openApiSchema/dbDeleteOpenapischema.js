const {
  HttpServerError,
  BadRequestError,
  NotAuthenticatedError,
  ForbiddenError,
  NotFoundError,
} = require("common");

const { OpenApiSchema } = require("models");
const { Op } = require("sequelize");
const { hexaLogger } = require("common");

const { OpenApiSchemaQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");

const { DBSoftDeleteSequelizeCommand } = require("dbCommand");

class DbDeleteOpenapischemaCommand extends DBSoftDeleteSequelizeCommand {
  constructor(input) {
    const instanceMode = true;
    super(input, OpenApiSchema, instanceMode);
    this.commandName = "dbDeleteOpenapischema";
    this.nullResult = false;
    this.objectName = "openApiSchema";
    this.serviceLabel = "salesai-platformadmin-service";
    this.dbEvent =
      "salesai1-platformadmin-service-dbevent-openapischema-deleted";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
  }

  initOwnership(input) {
    super.initOwnership(input);
  }

  async createQueryCacheInvalidator() {
    this.queryCacheInvalidator = new OpenApiSchemaQueryCacheInvalidator();
  }

  async indexDataToElastic() {
    const elasticIndexer = new ElasticIndexer(
      "openApiSchema",
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

const dbDeleteOpenapischema = async (input) => {
  input.id = input.openApiSchemaId;
  const dbDeleteCommand = new DbDeleteOpenapischemaCommand(input);
  return dbDeleteCommand.execute();
};

module.exports = dbDeleteOpenapischema;
