const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetMetricdatapointCommand is exported from main code

describe("DbGetMetricdatapointCommand", () => {
  let DbGetMetricdatapointCommand, dbGetMetricdatapoint;
  let sandbox, MetricDatapointStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.metricDatapointId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetMetricdatapointCommand, dbGetMetricdatapoint } = proxyquire(
      "../../../../src/db-layer/main/metricDatapoint/dbGetMetricdatapoint",
      {
        models: { MetricDatapoint: MetricDatapointStub },
        dbCommand: {
          DBGetSequelizeCommand: BaseCommandStub,
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
    it("should set command metadata correctly", () => {
      const cmd = new DbGetMetricdatapointCommand({});
      expect(cmd.commandName).to.equal("dbGetMetricdatapoint");
      expect(cmd.objectName).to.equal("metricDatapoint");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call MetricDatapoint.getCqrsJoins if exists", async () => {
      const cmd = new DbGetMetricdatapointCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(MetricDatapointStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete MetricDatapointStub.getCqrsJoins;
      const cmd = new DbGetMetricdatapointCommand({});
      let errorThrown = false;
      try {
        await cmd.getCqrsJoins({});
      } catch (err) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.false;
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbGetMetricdatapointCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetMetricdatapointCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetMetricdatapoint", () => {
    it("should execute dbGetMetricdatapoint and return metricDatapoint data", async () => {
      const result = await dbGetMetricdatapoint({
        metricDatapointId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
