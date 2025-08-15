const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateOpenapischemaCommand is exported from main code
describe("DbCreateOpenapischemaCommand", () => {
  let DbCreateOpenapischemaCommand, dbCreateOpenapischema;
  let sandbox,
    OpenApiSchemaStub,
    ElasticIndexerStub,
    getOpenApiSchemaByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getOpenApiSchemaByIdStub = sandbox
      .stub()
      .resolves({ id: 1, name: "Mock Client" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input) {
        this.input = input;
        this.dataClause = input.dataClause || {};
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: 9 };
      }

      async runDbCommand() {}
      async execute() {
        return this.dbData;
      }
      loadHookFunctions() {}
      createEntityCacher() {}
      normalizeSequalizeOps(w) {
        return w;
      }
      createQueryCacheInvalidator() {}
    };

    ({ DbCreateOpenapischemaCommand, dbCreateOpenapischema } = proxyquire(
      "../../../../src/db-layer/main/openApiSchema/dbCreateOpenapischema",
      {
        models: { OpenApiSchema: OpenApiSchemaStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getOpenApiSchemaById": getOpenApiSchemaByIdStub,
        dbCommand: { DBCreateSequelizeCommand: BaseCommandStub },
        "./query-cache-classes": {
          ClientQueryCacheInvalidator: sandbox.stub(),
        },
        common: {
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
    it("should assign initial properties", () => {
      const cmd = new DbCreateOpenapischemaCommand({});
      expect(cmd.commandName).to.equal("dbCreateOpenapischema");
      expect(cmd.objectName).to.equal("openApiSchema");
      expect(cmd.serviceLabel).to.equal("salesai-platformadmin-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-platformadmin-service-dbevent-openapischema-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getOpenApiSchemaById and indexData", async () => {
      const cmd = new DbCreateOpenapischemaCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getOpenApiSchemaByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing openApiSchema if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockopenApiSchema = { update: updateStub, getData: () => ({ id: 2 }) };

      OpenApiSchemaStub.findOne = sandbox.stub().resolves(mockopenApiSchema);
      OpenApiSchemaStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          version: "version_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateOpenapischemaCommand(input);
      await cmd.runDbCommand();

      expect(input.openApiSchema).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new openApiSchema if no unique match is found", async () => {
      OpenApiSchemaStub.findOne = sandbox.stub().resolves(null);
      OpenApiSchemaStub.findByPk = sandbox.stub().resolves(null);
      OpenApiSchemaStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          version: "version_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateOpenapischemaCommand(input);
      await cmd.runDbCommand();

      expect(input.openApiSchema).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(OpenApiSchemaStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      OpenApiSchemaStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateOpenapischemaCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateOpenapischema", () => {
    it("should execute successfully and return dbData", async () => {
      OpenApiSchemaStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "openApiSchema" } };
      const result = await dbCreateOpenapischema(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
