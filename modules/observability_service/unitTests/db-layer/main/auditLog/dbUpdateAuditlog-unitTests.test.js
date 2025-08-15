const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbUpdateAuditlogCommand is exported from main code

describe("DbUpdateAuditlogCommand", () => {
  let DbUpdateAuditlogCommand, dbUpdateAuditlog;
  let sandbox, getAuditLogByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getAuditLogByIdStub = sandbox
      .stub()
      .resolves({ id: 99, name: "Updated auditLog" });

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

    ({ DbUpdateAuditlogCommand, dbUpdateAuditlog } = proxyquire(
      "../../../../src/db-layer/main/auditLog/dbUpdateAuditlog",
      {
        "./utils/getAuditLogById": getAuditLogByIdStub,
        "./query-cache-classes": {
          AuditLogQueryCacheInvalidator: sandbox.stub(),
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
      const cmd = new DbUpdateAuditlogCommand({ AuditLogId: 1 });
      expect(cmd.commandName).to.equal("dbUpdateAuditlog");
      expect(cmd.objectName).to.equal("auditLog");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.isBulk).to.be.false;
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with dbData.id", async () => {
      const cmd = new DbUpdateAuditlogCommand({
        session: "s",
        requestId: "r",
      });

      cmd.dbData = { id: 101 };
      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getAuditLogByIdStub, 101);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().indexData, {
        id: 99,
        name: "Updated auditLog",
      });
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbUpdateAuditlogCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbUpdateAuditlogCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbUpdateAuditlog", () => {
    it("should execute update successfully", async () => {
      const result = await dbUpdateAuditlog({
        auditLogId: 99,
        session: "abc",
        requestId: "xyz",
      });

      expect(result).to.deep.equal({ id: 99 });
    });
  });
});
