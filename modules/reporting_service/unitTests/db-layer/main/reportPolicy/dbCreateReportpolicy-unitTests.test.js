const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateReportpolicyCommand is exported from main code
describe("DbCreateReportpolicyCommand", () => {
  let DbCreateReportpolicyCommand, dbCreateReportpolicy;
  let sandbox,
    ReportPolicyStub,
    ElasticIndexerStub,
    getReportPolicyByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getReportPolicyByIdStub = sandbox
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

    ({ DbCreateReportpolicyCommand, dbCreateReportpolicy } = proxyquire(
      "../../../../src/db-layer/main/reportPolicy/dbCreateReportpolicy",
      {
        models: { ReportPolicy: ReportPolicyStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getReportPolicyById": getReportPolicyByIdStub,
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
      const cmd = new DbCreateReportpolicyCommand({});
      expect(cmd.commandName).to.equal("dbCreateReportpolicy");
      expect(cmd.objectName).to.equal("reportPolicy");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportpolicy-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getReportPolicyById and indexData", async () => {
      const cmd = new DbCreateReportpolicyCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getReportPolicyByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing reportPolicy if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockreportPolicy = { update: updateStub, getData: () => ({ id: 2 }) };

      ReportPolicyStub.findOne = sandbox.stub().resolves(mockreportPolicy);
      ReportPolicyStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateReportpolicyCommand(input);
      await cmd.runDbCommand();

      expect(input.reportPolicy).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new reportPolicy if no unique match is found", async () => {
      ReportPolicyStub.findOne = sandbox.stub().resolves(null);
      ReportPolicyStub.findByPk = sandbox.stub().resolves(null);
      ReportPolicyStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateReportpolicyCommand(input);
      await cmd.runDbCommand();

      expect(input.reportPolicy).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(ReportPolicyStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      ReportPolicyStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateReportpolicyCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateReportpolicy", () => {
    it("should execute successfully and return dbData", async () => {
      ReportPolicyStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "reportPolicy" } };
      const result = await dbCreateReportpolicy(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
