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

const { DBCreateSequelizeCommand } = require("dbCommand");

const { OpenApiSchemaQueryCacheInvalidator } = require("./query-cache-classes");

const { ElasticIndexer } = require("serviceCommon");
const getOpenApiSchemaById = require("./utils/getOpenApiSchemaById");

class DbCreateOpenapischemaCommand extends DBCreateSequelizeCommand {
  constructor(input) {
    super(input);
    this.commandName = "dbCreateOpenapischema";
    this.objectName = "openApiSchema";
    this.serviceLabel = "salesai-platformadmin-service";
    this.dbEvent =
      "salesai1-platformadmin-service-dbevent-openapischema-created";
  }

  loadHookFunctions() {
    super.loadHookFunctions({});
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
    const dbData = await getOpenApiSchemaById(this.dbData.id);
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

    let openApiSchema = null;
    let whereClause = {};
    let updated = false;
    let exists = false;
    try {
      whereClause = {
        version: this.dataClause.version,
      };

      openApiSchema =
        openApiSchema || (await OpenApiSchema.findOne({ where: whereClause }));

      if (openApiSchema) {
        throw new BadRequestError(
          "errMsg_DuplicateIndexErrorWithFields:" + "version",
        );
      }

      if (!updated && this.dataClause.id && !exists) {
        openApiSchema =
          openApiSchema || (await OpenApiSchema.findByPk(this.dataClause.id));
        if (openApiSchema) {
          delete this.dataClause.id;
          this.dataClause.isActive = true;
          await openApiSchema.update(this.dataClause);
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
        "Error in checking unique index when creating OpenApiSchema",
        eDetail,
      );
    }

    if (!updated && !exists) {
      openApiSchema = await OpenApiSchema.create(this.dataClause);
    }

    this.dbData = openApiSchema.getData();
    this.input.openApiSchema = this.dbData;
    await this.create_childs();
  }
}

const dbCreateOpenapischema = async (input) => {
  const dbCreateCommand = new DbCreateOpenapischemaCommand(input);
  return await dbCreateCommand.execute();
};

module.exports = dbCreateOpenapischema;
