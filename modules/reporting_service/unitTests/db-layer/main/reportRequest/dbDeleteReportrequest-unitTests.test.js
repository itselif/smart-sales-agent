const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteReportrequestCommand is exported from main code

describe("DbDeleteReportrequestCommand", () => {
  let DbDeleteReportrequestCommand, dbDeleteReportrequest;
  let sandbox,
    ReportRequestStub,
    getReportRequestByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {};

    getReportRequestByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportRequestId || 123 };
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

    ({ DbDeleteReportrequestCommand, dbDeleteReportrequest } = proxyquire(
      "../../../../src/db-layer/main/reportRequest/dbDeleteReportrequest",
      {
        models: { ReportRequest: ReportRequestStub },
        "./query-cache-classes": {
          ReportRequestQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getReportRequestById": getReportRequestByIdStub,
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
      const cmd = new DbDeleteReportrequestCommand({});
      expect(cmd.commandName).to.equal("dbDeleteReportrequest");
      expect(cmd.objectName).to.equal("reportRequest");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportrequest-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteReportrequestCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteReportrequest", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getReportRequestByIdStub.resolves(mockInstance);

      const input = {
        reportRequestId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteReportrequest(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
