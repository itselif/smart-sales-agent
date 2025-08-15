const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbUpdateReportrequestCommand is exported from main code

describe("DbUpdateReportrequestCommand", () => {
  let DbUpdateReportrequestCommand, dbUpdateReportrequest;
  let sandbox, getReportRequestByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getReportRequestByIdStub = sandbox
      .stub()
      .resolves({ id: 99, name: "Updated reportRequest" });

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

    ({ DbUpdateReportrequestCommand, dbUpdateReportrequest } = proxyquire(
      "../../../../src/db-layer/main/reportRequest/dbUpdateReportrequest",
      {
        "./utils/getReportRequestById": getReportRequestByIdStub,
        "./query-cache-classes": {
          ReportRequestQueryCacheInvalidator: sandbox.stub(),
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
      const cmd = new DbUpdateReportrequestCommand({ ReportRequestId: 1 });
      expect(cmd.commandName).to.equal("dbUpdateReportrequest");
      expect(cmd.objectName).to.equal("reportRequest");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.isBulk).to.be.false;
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with dbData.id", async () => {
      const cmd = new DbUpdateReportrequestCommand({
        session: "s",
        requestId: "r",
      });

      cmd.dbData = { id: 101 };
      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getReportRequestByIdStub, 101);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().indexData, {
        id: 99,
        name: "Updated reportRequest",
      });
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbUpdateReportrequestCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbUpdateReportrequestCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbUpdateReportrequest", () => {
    it("should execute update successfully", async () => {
      const result = await dbUpdateReportrequest({
        reportRequestId: 99,
        session: "abc",
        requestId: "xyz",
      });

      expect(result).to.deep.equal({ id: 99 });
    });
  });
});
