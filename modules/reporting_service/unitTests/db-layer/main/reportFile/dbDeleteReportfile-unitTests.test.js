const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteReportfileCommand is exported from main code

describe("DbDeleteReportfileCommand", () => {
  let DbDeleteReportfileCommand, dbDeleteReportfile;
  let sandbox,
    ReportFileStub,
    getReportFileByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {};

    getReportFileByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportFileId || 123 };
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

    ({ DbDeleteReportfileCommand, dbDeleteReportfile } = proxyquire(
      "../../../../src/db-layer/main/reportFile/dbDeleteReportfile",
      {
        models: { ReportFile: ReportFileStub },
        "./query-cache-classes": {
          ReportFileQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getReportFileById": getReportFileByIdStub,
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
      const cmd = new DbDeleteReportfileCommand({});
      expect(cmd.commandName).to.equal("dbDeleteReportfile");
      expect(cmd.objectName).to.equal("reportFile");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportfile-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteReportfileCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteReportfile", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getReportFileByIdStub.resolves(mockInstance);

      const input = {
        reportFileId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteReportfile(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
