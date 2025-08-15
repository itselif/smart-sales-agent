const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteReportpolicyCommand is exported from main code

describe("DbDeleteReportpolicyCommand", () => {
  let DbDeleteReportpolicyCommand, dbDeleteReportpolicy;
  let sandbox,
    ReportPolicyStub,
    getReportPolicyByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {};

    getReportPolicyByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportPolicyId || 123 };
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

    ({ DbDeleteReportpolicyCommand, dbDeleteReportpolicy } = proxyquire(
      "../../../../src/db-layer/main/reportPolicy/dbDeleteReportpolicy",
      {
        models: { ReportPolicy: ReportPolicyStub },
        "./query-cache-classes": {
          ReportPolicyQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getReportPolicyById": getReportPolicyByIdStub,
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
      const cmd = new DbDeleteReportpolicyCommand({});
      expect(cmd.commandName).to.equal("dbDeleteReportpolicy");
      expect(cmd.objectName).to.equal("reportPolicy");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportpolicy-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteReportpolicyCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteReportpolicy", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getReportPolicyByIdStub.resolves(mockInstance);

      const input = {
        reportPolicyId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteReportpolicy(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
