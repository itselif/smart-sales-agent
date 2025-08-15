const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetAuditlogCommand is exported from main code

describe("DbGetAuditlogCommand", () => {
  let DbGetAuditlogCommand, dbGetAuditlog;
  let sandbox, AuditLogStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.auditLogId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetAuditlogCommand, dbGetAuditlog } = proxyquire(
      "../../../../src/db-layer/main/auditLog/dbGetAuditlog",
      {
        models: { AuditLog: AuditLogStub },
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
      const cmd = new DbGetAuditlogCommand({});
      expect(cmd.commandName).to.equal("dbGetAuditlog");
      expect(cmd.objectName).to.equal("auditLog");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call AuditLog.getCqrsJoins if exists", async () => {
      const cmd = new DbGetAuditlogCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(AuditLogStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete AuditLogStub.getCqrsJoins;
      const cmd = new DbGetAuditlogCommand({});
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
      const cmd = new DbGetAuditlogCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetAuditlogCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetAuditlog", () => {
    it("should execute dbGetAuditlog and return auditLog data", async () => {
      const result = await dbGetAuditlog({
        auditLogId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
