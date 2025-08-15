const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateAnomalyeventCommand is exported from main code
describe("DbCreateAnomalyeventCommand", () => {
  let DbCreateAnomalyeventCommand, dbCreateAnomalyevent;
  let sandbox,
    AnomalyEventStub,
    ElasticIndexerStub,
    getAnomalyEventByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getAnomalyEventByIdStub = sandbox
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

    ({ DbCreateAnomalyeventCommand, dbCreateAnomalyevent } = proxyquire(
      "../../../../src/db-layer/main/anomalyEvent/dbCreateAnomalyevent",
      {
        models: { AnomalyEvent: AnomalyEventStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getAnomalyEventById": getAnomalyEventByIdStub,
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
      const cmd = new DbCreateAnomalyeventCommand({});
      expect(cmd.commandName).to.equal("dbCreateAnomalyevent");
      expect(cmd.objectName).to.equal("anomalyEvent");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-anomalyevent-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getAnomalyEventById and indexData", async () => {
      const cmd = new DbCreateAnomalyeventCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getAnomalyEventByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing anomalyEvent if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockanomalyEvent = { update: updateStub, getData: () => ({ id: 2 }) };

      AnomalyEventStub.findOne = sandbox.stub().resolves(mockanomalyEvent);
      AnomalyEventStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          anomalyType: "anomalyType_value",
          
          detectedAt: "detectedAt_value",
          
          status: "status_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateAnomalyeventCommand(input);
      await cmd.runDbCommand();

      expect(input.anomalyEvent).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new anomalyEvent if no unique match is found", async () => {
      AnomalyEventStub.findOne = sandbox.stub().resolves(null);
      AnomalyEventStub.findByPk = sandbox.stub().resolves(null);
      AnomalyEventStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          anomalyType: "anomalyType_value",
          
          detectedAt: "detectedAt_value",
          
          status: "status_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateAnomalyeventCommand(input);
      await cmd.runDbCommand();

      expect(input.anomalyEvent).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(AnomalyEventStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      AnomalyEventStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateAnomalyeventCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateAnomalyevent", () => {
    it("should execute successfully and return dbData", async () => {
      AnomalyEventStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "anomalyEvent" } };
      const result = await dbCreateAnomalyevent(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
