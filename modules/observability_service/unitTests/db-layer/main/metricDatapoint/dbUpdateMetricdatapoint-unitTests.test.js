const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbUpdateMetricdatapointCommand is exported from main code

describe("DbUpdateMetricdatapointCommand", () => {
  let DbUpdateMetricdatapointCommand, dbUpdateMetricdatapoint;
  let sandbox, getMetricDatapointByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getMetricDatapointByIdStub = sandbox
      .stub()
      .resolves({ id: 99, name: "Updated metricDatapoint" });

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

    ({ DbUpdateMetricdatapointCommand, dbUpdateMetricdatapoint } = proxyquire(
      "../../../../src/db-layer/main/metricDatapoint/dbUpdateMetricdatapoint",
      {
        "./utils/getMetricDatapointById": getMetricDatapointByIdStub,
        "./query-cache-classes": {
          MetricDatapointQueryCacheInvalidator: sandbox.stub(),
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
      const cmd = new DbUpdateMetricdatapointCommand({ MetricDatapointId: 1 });
      expect(cmd.commandName).to.equal("dbUpdateMetricdatapoint");
      expect(cmd.objectName).to.equal("metricDatapoint");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.isBulk).to.be.false;
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with dbData.id", async () => {
      const cmd = new DbUpdateMetricdatapointCommand({
        session: "s",
        requestId: "r",
      });

      cmd.dbData = { id: 101 };
      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getMetricDatapointByIdStub, 101);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().indexData, {
        id: 99,
        name: "Updated metricDatapoint",
      });
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbUpdateMetricdatapointCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbUpdateMetricdatapointCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbUpdateMetricdatapoint", () => {
    it("should execute update successfully", async () => {
      const result = await dbUpdateMetricdatapoint({
        metricDatapointId: 99,
        session: "abc",
        requestId: "xyz",
      });

      expect(result).to.deep.equal({ id: 99 });
    });
  });
});
