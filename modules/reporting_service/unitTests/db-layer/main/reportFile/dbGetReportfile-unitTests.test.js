const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetReportfileCommand is exported from main code

describe("DbGetReportfileCommand", () => {
  let DbGetReportfileCommand, dbGetReportfile;
  let sandbox, ReportFileStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportFileId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetReportfileCommand, dbGetReportfile } = proxyquire(
      "../../../../src/db-layer/main/reportFile/dbGetReportfile",
      {
        models: { ReportFile: ReportFileStub },
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
      const cmd = new DbGetReportfileCommand({});
      expect(cmd.commandName).to.equal("dbGetReportfile");
      expect(cmd.objectName).to.equal("reportFile");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call ReportFile.getCqrsJoins if exists", async () => {
      const cmd = new DbGetReportfileCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(ReportFileStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete ReportFileStub.getCqrsJoins;
      const cmd = new DbGetReportfileCommand({});
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
      const cmd = new DbGetReportfileCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetReportfileCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetReportfile", () => {
    it("should execute dbGetReportfile and return reportFile data", async () => {
      const result = await dbGetReportfile({
        reportFileId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
