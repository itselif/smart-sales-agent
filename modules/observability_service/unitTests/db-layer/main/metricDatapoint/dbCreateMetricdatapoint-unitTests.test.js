const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateMetricdatapointCommand is exported from main code
describe("DbCreateMetricdatapointCommand", () => {
  let DbCreateMetricdatapointCommand, dbCreateMetricdatapoint;
  let sandbox,
    MetricDatapointStub,
    ElasticIndexerStub,
    getMetricDatapointByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getMetricDatapointByIdStub = sandbox
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

    ({ DbCreateMetricdatapointCommand, dbCreateMetricdatapoint } = proxyquire(
      "../../../../src/db-layer/main/metricDatapoint/dbCreateMetricdatapoint",
      {
        models: { MetricDatapoint: MetricDatapointStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getMetricDatapointById": getMetricDatapointByIdStub,
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
      const cmd = new DbCreateMetricdatapointCommand({});
      expect(cmd.commandName).to.equal("dbCreateMetricdatapoint");
      expect(cmd.objectName).to.equal("metricDatapoint");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-metricdatapoint-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getMetricDatapointById and indexData", async () => {
      const cmd = new DbCreateMetricdatapointCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getMetricDatapointByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing metricDatapoint if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockmetricDatapoint = { update: updateStub, getData: () => ({ id: 2 }) };

      MetricDatapointStub.findOne = sandbox.stub().resolves(mockmetricDatapoint);
      MetricDatapointStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          metricType: "metricType_value",
          
          targetType: "targetType_value",
          
          targetId: "targetId_value",
          
          periodStart: "periodStart_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateMetricdatapointCommand(input);
      await cmd.runDbCommand();

      expect(input.metricDatapoint).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new metricDatapoint if no unique match is found", async () => {
      MetricDatapointStub.findOne = sandbox.stub().resolves(null);
      MetricDatapointStub.findByPk = sandbox.stub().resolves(null);
      MetricDatapointStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          metricType: "metricType_value",
          
          targetType: "targetType_value",
          
          targetId: "targetId_value",
          
          periodStart: "periodStart_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateMetricdatapointCommand(input);
      await cmd.runDbCommand();

      expect(input.metricDatapoint).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(MetricDatapointStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      MetricDatapointStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateMetricdatapointCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateMetricdatapoint", () => {
    it("should execute successfully and return dbData", async () => {
      MetricDatapointStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "metricDatapoint" } };
      const result = await dbCreateMetricdatapoint(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
