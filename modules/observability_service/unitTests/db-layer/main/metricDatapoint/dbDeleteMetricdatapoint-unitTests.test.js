const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteMetricdatapointCommand is exported from main code

describe("DbDeleteMetricdatapointCommand", () => {
  let DbDeleteMetricdatapointCommand, dbDeleteMetricdatapoint;
  let sandbox,
    MetricDatapointStub,
    getMetricDatapointByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {};

    getMetricDatapointByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.metricDatapointId || 123 };
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

    ({ DbDeleteMetricdatapointCommand, dbDeleteMetricdatapoint } = proxyquire(
      "../../../../src/db-layer/main/metricDatapoint/dbDeleteMetricdatapoint",
      {
        models: { MetricDatapoint: MetricDatapointStub },
        "./query-cache-classes": {
          MetricDatapointQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getMetricDatapointById": getMetricDatapointByIdStub,
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
      const cmd = new DbDeleteMetricdatapointCommand({});
      expect(cmd.commandName).to.equal("dbDeleteMetricdatapoint");
      expect(cmd.objectName).to.equal("metricDatapoint");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-metricdatapoint-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteMetricdatapointCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteMetricdatapoint", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getMetricDatapointByIdStub.resolves(mockInstance);

      const input = {
        metricDatapointId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteMetricdatapoint(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
