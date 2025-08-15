const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetAnomalyeventCommand is exported from main code

describe("DbGetAnomalyeventCommand", () => {
  let DbGetAnomalyeventCommand, dbGetAnomalyevent;
  let sandbox, AnomalyEventStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.anomalyEventId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetAnomalyeventCommand, dbGetAnomalyevent } = proxyquire(
      "../../../../src/db-layer/main/anomalyEvent/dbGetAnomalyevent",
      {
        models: { AnomalyEvent: AnomalyEventStub },
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
      const cmd = new DbGetAnomalyeventCommand({});
      expect(cmd.commandName).to.equal("dbGetAnomalyevent");
      expect(cmd.objectName).to.equal("anomalyEvent");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call AnomalyEvent.getCqrsJoins if exists", async () => {
      const cmd = new DbGetAnomalyeventCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(AnomalyEventStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete AnomalyEventStub.getCqrsJoins;
      const cmd = new DbGetAnomalyeventCommand({});
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
      const cmd = new DbGetAnomalyeventCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetAnomalyeventCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetAnomalyevent", () => {
    it("should execute dbGetAnomalyevent and return anomalyEvent data", async () => {
      const result = await dbGetAnomalyevent({
        anomalyEventId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
