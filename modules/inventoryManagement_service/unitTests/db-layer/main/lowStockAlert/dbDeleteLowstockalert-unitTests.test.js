const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteLowstockalertCommand is exported from main code

describe("DbDeleteLowstockalertCommand", () => {
  let DbDeleteLowstockalertCommand, dbDeleteLowstockalert;
  let sandbox,
    LowStockAlertStub,
    getLowStockAlertByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    LowStockAlertStub = {};

    getLowStockAlertByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.lowStockAlertId || 123 };
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

    ({ DbDeleteLowstockalertCommand, dbDeleteLowstockalert } = proxyquire(
      "../../../../src/db-layer/main/lowStockAlert/dbDeleteLowstockalert",
      {
        models: { LowStockAlert: LowStockAlertStub },
        "./query-cache-classes": {
          LowStockAlertQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getLowStockAlertById": getLowStockAlertByIdStub,
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
      const cmd = new DbDeleteLowstockalertCommand({});
      expect(cmd.commandName).to.equal("dbDeleteLowstockalert");
      expect(cmd.objectName).to.equal("lowStockAlert");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-lowstockalert-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteLowstockalertCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteLowstockalert", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getLowStockAlertByIdStub.resolves(mockInstance);

      const input = {
        lowStockAlertId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteLowstockalert(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
