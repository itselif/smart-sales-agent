const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteAuditlogCommand is exported from main code

describe("DbDeleteAuditlogCommand", () => {
  let DbDeleteAuditlogCommand, dbDeleteAuditlog;
  let sandbox,
    AuditLogStub,
    getAuditLogByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {};

    getAuditLogByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.auditLogId || 123 };
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

    ({ DbDeleteAuditlogCommand, dbDeleteAuditlog } = proxyquire(
      "../../../../src/db-layer/main/auditLog/dbDeleteAuditlog",
      {
        models: { AuditLog: AuditLogStub },
        "./query-cache-classes": {
          AuditLogQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getAuditLogById": getAuditLogByIdStub,
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
      const cmd = new DbDeleteAuditlogCommand({});
      expect(cmd.commandName).to.equal("dbDeleteAuditlog");
      expect(cmd.objectName).to.equal("auditLog");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-auditlog-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteAuditlogCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteAuditlog", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getAuditLogByIdStub.resolves(mockInstance);

      const input = {
        auditLogId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteAuditlog(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
