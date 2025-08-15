const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbUpdateOpenapischemaCommand is exported from main code

describe("DbUpdateOpenapischemaCommand", () => {
  let DbUpdateOpenapischemaCommand, dbUpdateOpenapischema;
  let sandbox, getOpenApiSchemaByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getOpenApiSchemaByIdStub = sandbox
      .stub()
      .resolves({ id: 99, name: "Updated openApiSchema" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: input.id || 99 };
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbUpdateOpenapischemaCommand, dbUpdateOpenapischema } = proxyquire(
      "../../../../src/db-layer/main/openApiSchema/dbUpdateOpenapischema",
      {
        "./utils/getOpenApiSchemaById": getOpenApiSchemaByIdStub,
        "./query-cache-classes": {
          OpenApiSchemaQueryCacheInvalidator: sandbox.stub(),
        },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBUpdateSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        models: {
          User: {},
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should set command metadata correctly", () => {
      const cmd = new DbUpdateOpenapischemaCommand({ OpenApiSchemaId: 1 });
      expect(cmd.commandName).to.equal("dbUpdateOpenapischema");
      expect(cmd.objectName).to.equal("openApiSchema");
      expect(cmd.serviceLabel).to.equal("salesai-platformadmin-service");
      expect(cmd.isBulk).to.be.false;
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with dbData.id", async () => {
      const cmd = new DbUpdateOpenapischemaCommand({
        session: "s",
        requestId: "r",
      });

      cmd.dbData = { id: 101 };
      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getOpenApiSchemaByIdStub, 101);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().indexData, {
        id: 99,
        name: "Updated openApiSchema",
      });
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbUpdateOpenapischemaCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbUpdateOpenapischemaCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbUpdateOpenapischema", () => {
    it("should execute update successfully", async () => {
      const result = await dbUpdateOpenapischema({
        openApiSchemaId: 99,
        session: "abc",
        requestId: "xyz",
      });

      expect(result).to.deep.equal({ id: 99 });
    });
  });
});
