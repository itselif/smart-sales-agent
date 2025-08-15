const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteOpenapischemaCommand is exported from main code

describe("DbDeleteOpenapischemaCommand", () => {
  let DbDeleteOpenapischemaCommand, dbDeleteOpenapischema;
  let sandbox,
    OpenApiSchemaStub,
    getOpenApiSchemaByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {};

    getOpenApiSchemaByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.openApiSchemaId || 123 };
        this.dbInstance = null;
      }

      loadHookFunctions() {}
      initOwnership() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbDeleteOpenapischemaCommand, dbDeleteOpenapischema } = proxyquire(
      "../../../../src/db-layer/main/openApiSchema/dbDeleteOpenapischema",
      {
        models: { OpenApiSchema: OpenApiSchemaStub },
        "./query-cache-classes": {
          OpenApiSchemaQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getOpenApiSchemaById": getOpenApiSchemaByIdStub,
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBSoftDeleteSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
          HttpServerError: class extends Error {
            constructor(msg, details) {
              super(msg);
              this.details = details;
            }
          },
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should set command metadata correctly", () => {
      const cmd = new DbDeleteOpenapischemaCommand({});
      expect(cmd.commandName).to.equal("dbDeleteOpenapischema");
      expect(cmd.objectName).to.equal("openApiSchema");
      expect(cmd.serviceLabel).to.equal("salesai-platformadmin-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-platformadmin-service-dbevent-openapischema-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteOpenapischemaCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteOpenapischema", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getOpenApiSchemaByIdStub.resolves(mockInstance);

      const input = {
        openApiSchemaId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteOpenapischema(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
