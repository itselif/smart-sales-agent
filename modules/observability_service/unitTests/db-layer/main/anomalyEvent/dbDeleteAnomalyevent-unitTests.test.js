const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteAnomalyeventCommand is exported from main code

describe("DbDeleteAnomalyeventCommand", () => {
  let DbDeleteAnomalyeventCommand, dbDeleteAnomalyevent;
  let sandbox,
    AnomalyEventStub,
    getAnomalyEventByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {};

    getAnomalyEventByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.anomalyEventId || 123 };
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

    ({ DbDeleteAnomalyeventCommand, dbDeleteAnomalyevent } = proxyquire(
      "../../../../src/db-layer/main/anomalyEvent/dbDeleteAnomalyevent",
      {
        models: { AnomalyEvent: AnomalyEventStub },
        "./query-cache-classes": {
          AnomalyEventQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getAnomalyEventById": getAnomalyEventByIdStub,
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
      const cmd = new DbDeleteAnomalyeventCommand({});
      expect(cmd.commandName).to.equal("dbDeleteAnomalyevent");
      expect(cmd.objectName).to.equal("anomalyEvent");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-anomalyevent-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteAnomalyeventCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteAnomalyevent", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getAnomalyEventByIdStub.resolves(mockInstance);

      const input = {
        anomalyEventId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteAnomalyevent(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
