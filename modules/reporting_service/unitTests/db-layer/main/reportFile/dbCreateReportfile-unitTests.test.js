const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateReportfileCommand is exported from main code
describe("DbCreateReportfileCommand", () => {
  let DbCreateReportfileCommand, dbCreateReportfile;
  let sandbox,
    ReportFileStub,
    ElasticIndexerStub,
    getReportFileByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getReportFileByIdStub = sandbox
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

    ({ DbCreateReportfileCommand, dbCreateReportfile } = proxyquire(
      "../../../../src/db-layer/main/reportFile/dbCreateReportfile",
      {
        models: { ReportFile: ReportFileStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getReportFileById": getReportFileByIdStub,
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
      const cmd = new DbCreateReportfileCommand({});
      expect(cmd.commandName).to.equal("dbCreateReportfile");
      expect(cmd.objectName).to.equal("reportFile");
      expect(cmd.serviceLabel).to.equal("salesai-reporting-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-reporting-service-dbevent-reportfile-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getReportFileById and indexData", async () => {
      const cmd = new DbCreateReportfileCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getReportFileByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing reportFile if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockreportFile = { update: updateStub, getData: () => ({ id: 2 }) };

      ReportFileStub.findOne = sandbox.stub().resolves(mockreportFile);
      ReportFileStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          id: "id_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateReportfileCommand(input);
      await cmd.runDbCommand();

      expect(input.reportFile).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new reportFile if no unique match is found", async () => {
      ReportFileStub.findOne = sandbox.stub().resolves(null);
      ReportFileStub.findByPk = sandbox.stub().resolves(null);
      ReportFileStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          name: "name_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateReportfileCommand(input);
      await cmd.runDbCommand();

      expect(input.reportFile).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(ReportFileStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      ReportFileStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateReportfileCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateReportfile", () => {
    it("should execute successfully and return dbData", async () => {
      ReportFileStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "reportFile" } };
      const result = await dbCreateReportfile(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
