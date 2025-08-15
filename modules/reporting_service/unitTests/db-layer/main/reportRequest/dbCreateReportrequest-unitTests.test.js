const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateReportrequestCommand is exported from main code
describe("DbCreateReportrequestCommand", () => {
  let DbCreateReportrequestCommand, dbCreateReportrequest;
  let sandbox,
    ReportRequestStub,
    ElasticIndexerStub,
    getReportRequestByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getReportRequestByIdStub = sandbox
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

    ({ DbCreateReportrequestCommand, dbCreateReportrequest } = proxyquire(
      "../../../../src/db-layer/main/reportRequest/dbCreateReportrequest",
      {
        models: { ReportRequest: ReportRequestStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getReportRequestById": getReportRequestByIdStub,
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
      const cmd = new DbCreateReportrequestCommand({});
      expect(cmd.commandName).to.equal("dbCreateReportrequest");
      expect(cmd.objectName).to.equal("reportRequest");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportrequest-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getReportRequestById and indexData", async () => {
      const cmd = new DbCreateReportrequestCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getReportRequestByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing reportRequest if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockreportRequest = { update: updateStub, getData: () => ({ id: 2 }) };

      ReportRequestStub.findOne = sandbox.stub().resolves(mockreportRequest);
      ReportRequestStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateReportrequestCommand(input);
      await cmd.runDbCommand();

      expect(input.reportRequest).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new reportRequest if no unique match is found", async () => {
      ReportRequestStub.findOne = sandbox.stub().resolves(null);
      ReportRequestStub.findByPk = sandbox.stub().resolves(null);
      ReportRequestStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateReportrequestCommand(input);
      await cmd.runDbCommand();

      expect(input.reportRequest).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(ReportRequestStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      ReportRequestStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateReportrequestCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateReportrequest", () => {
    it("should execute successfully and return dbData", async () => {
      ReportRequestStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "reportRequest" } };
      const result = await dbCreateReportrequest(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
