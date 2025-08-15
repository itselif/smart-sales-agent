const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateAuditlogCommand is exported from main code
describe("DbCreateAuditlogCommand", () => {
  let DbCreateAuditlogCommand, dbCreateAuditlog;
  let sandbox,
    AuditLogStub,
    ElasticIndexerStub,
    getAuditLogByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AuditLogStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getAuditLogByIdStub = sandbox
      .stub()
      .resolves({ id: 1, name: "Mock Client" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input) {
        this.input = input;
        this.dataClause = input.dataClause || {};
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: 9 };
      }

      async runDbCommand() {}
      async execute() {
        return this.dbData;
      }
      loadHookFunctions() {}
      createEntityCacher() {}
      normalizeSequalizeOps(w) {
        return w;
      }
      createQueryCacheInvalidator() {}
    };

    ({ DbCreateAuditlogCommand, dbCreateAuditlog } = proxyquire(
      "../../../../src/db-layer/main/auditLog/dbCreateAuditlog",
      {
        models: { AuditLog: AuditLogStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getAuditLogById": getAuditLogByIdStub,
        dbCommand: { DBCreateSequelizeCommand: BaseCommandStub },
        "./query-cache-classes": {
          ClientQueryCacheInvalidator: sandbox.stub(),
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
    it("should assign initial properties", () => {
      const cmd = new DbCreateAuditlogCommand({});
      expect(cmd.commandName).to.equal("dbCreateAuditlog");
      expect(cmd.objectName).to.equal("auditLog");
      expect(cmd.serviceLabel).to.equal("salesai-observability-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-observability-service-dbevent-auditlog-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getAuditLogById and indexData", async () => {
      const cmd = new DbCreateAuditlogCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getAuditLogByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing auditLog if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockauditLog = { update: updateStub, getData: () => ({ id: 2 }) };

      AuditLogStub.findOne = sandbox.stub().resolves(mockauditLog);
      AuditLogStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          storeId: "storeId_value",
          
          userId: "userId_value",
          
          createdAt: "createdAt_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateAuditlogCommand(input);
      await cmd.runDbCommand();

      expect(input.auditLog).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new auditLog if no unique match is found", async () => {
      AuditLogStub.findOne = sandbox.stub().resolves(null);
      AuditLogStub.findByPk = sandbox.stub().resolves(null);
      AuditLogStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          storeId: "storeId_value",
          
          userId: "userId_value",
          
          createdAt: "createdAt_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateAuditlogCommand(input);
      await cmd.runDbCommand();

      expect(input.auditLog).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(AuditLogStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      AuditLogStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateAuditlogCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateAuditlog", () => {
    it("should execute successfully and return dbData", async () => {
      AuditLogStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "auditLog" } };
      const result = await dbCreateAuditlog(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
