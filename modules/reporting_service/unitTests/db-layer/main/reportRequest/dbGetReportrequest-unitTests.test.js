const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetReportrequestCommand is exported from main code

describe("DbGetReportrequestCommand", () => {
  let DbGetReportrequestCommand, dbGetReportrequest;
  let sandbox, ReportRequestStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportRequestId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetReportrequestCommand, dbGetReportrequest } = proxyquire(
      "../../../../src/db-layer/main/reportRequest/dbGetReportrequest",
      {
        models: { ReportRequest: ReportRequestStub },
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
      const cmd = new DbGetReportrequestCommand({});
      expect(cmd.commandName).to.equal("dbGetReportrequest");
      expect(cmd.objectName).to.equal("reportRequest");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call ReportRequest.getCqrsJoins if exists", async () => {
      const cmd = new DbGetReportrequestCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(ReportRequestStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete ReportRequestStub.getCqrsJoins;
      const cmd = new DbGetReportrequestCommand({});
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
      const cmd = new DbGetReportrequestCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetReportrequestCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetReportrequest", () => {
    it("should execute dbGetReportrequest and return reportRequest data", async () => {
      const result = await dbGetReportrequest({
        reportRequestId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
