const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateLowstockalertCommand is exported from main code
describe("DbCreateLowstockalertCommand", () => {
  let DbCreateLowstockalertCommand, dbCreateLowstockalert;
  let sandbox,
    LowStockAlertStub,
    ElasticIndexerStub,
    getLowStockAlertByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getLowStockAlertByIdStub = sandbox
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

    ({ DbCreateLowstockalertCommand, dbCreateLowstockalert } = proxyquire(
      "../../../../src/db-layer/main/lowStockAlert/dbCreateLowstockalert",
      {
        models: { LowStockAlert: LowStockAlertStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getLowStockAlertById": getLowStockAlertByIdStub,
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
      const cmd = new DbCreateLowstockalertCommand({});
      expect(cmd.commandName).to.equal("dbCreateLowstockalert");
      expect(cmd.objectName).to.equal("lowStockAlert");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-lowstockalert-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getLowStockAlertById and indexData", async () => {
      const cmd = new DbCreateLowstockalertCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getLowStockAlertByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing lowStockAlert if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mocklowStockAlert = { update: updateStub, getData: () => ({ id: 2 }) };

      LowStockAlertStub.findOne = sandbox.stub().resolves(mocklowStockAlert);
      LowStockAlertStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateLowstockalertCommand(input);
      await cmd.runDbCommand();

      expect(input.lowStockAlert).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new lowStockAlert if no unique match is found", async () => {
      LowStockAlertStub.findOne = sandbox.stub().resolves(null);
      LowStockAlertStub.findByPk = sandbox.stub().resolves(null);
      LowStockAlertStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateLowstockalertCommand(input);
      await cmd.runDbCommand();

      expect(input.lowStockAlert).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(LowStockAlertStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      LowStockAlertStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateLowstockalertCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateLowstockalert", () => {
    it("should execute successfully and return dbData", async () => {
      LowStockAlertStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "lowStockAlert" } };
      const result = await dbCreateLowstockalert(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
