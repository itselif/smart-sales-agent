const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetReportpolicyCommand is exported from main code

describe("DbGetReportpolicyCommand", () => {
  let DbGetReportpolicyCommand, dbGetReportpolicy;
  let sandbox, ReportPolicyStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.reportPolicyId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetReportpolicyCommand, dbGetReportpolicy } = proxyquire(
      "../../../../src/db-layer/main/reportPolicy/dbGetReportpolicy",
      {
        models: { ReportPolicy: ReportPolicyStub },
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
      const cmd = new DbGetReportpolicyCommand({});
      expect(cmd.commandName).to.equal("dbGetReportpolicy");
      expect(cmd.objectName).to.equal("reportPolicy");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call ReportPolicy.getCqrsJoins if exists", async () => {
      const cmd = new DbGetReportpolicyCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(ReportPolicyStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete ReportPolicyStub.getCqrsJoins;
      const cmd = new DbGetReportpolicyCommand({});
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
      const cmd = new DbGetReportpolicyCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetReportpolicyCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetReportpolicy", () => {
    it("should execute dbGetReportpolicy and return reportPolicy data", async () => {
      const result = await dbGetReportpolicy({
        reportPolicyId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
