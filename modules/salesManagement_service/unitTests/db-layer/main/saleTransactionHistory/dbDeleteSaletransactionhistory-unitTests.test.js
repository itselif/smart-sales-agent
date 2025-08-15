const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteSaletransactionhistoryCommand is exported from main code

describe("DbDeleteSaletransactionhistoryCommand", () => {
  let DbDeleteSaletransactionhistoryCommand, dbDeleteSaletransactionhistory;
  let sandbox,
    SaleTransactionHistoryStub,
    getSaleTransactionHistoryByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {};

    getSaleTransactionHistoryByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.saleTransactionHistoryId || 123 };
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

    ({ DbDeleteSaletransactionhistoryCommand, dbDeleteSaletransactionhistory } =
      proxyquire(
        "../../../../src/db-layer/main/saleTransactionHistory/dbDeleteSaletransactionhistory",
        {
          models: { SaleTransactionHistory: SaleTransactionHistoryStub },
          "./query-cache-classes": {
            SaleTransactionHistoryQueryCacheInvalidator: sandbox.stub(),
          },
          "./utils/getSaleTransactionHistoryById":
            getSaleTransactionHistoryByIdStub,
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
      const cmd = new DbDeleteSaletransactionhistoryCommand({});
      expect(cmd.commandName).to.equal("dbDeleteSaletransactionhistory");
      expect(cmd.objectName).to.equal("saleTransactionHistory");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-salesmanagement-service-dbevent-saletransactionhistory-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteSaletransactionhistoryCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteSaletransactionhistory", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getSaleTransactionHistoryByIdStub.resolves(mockInstance);

      const input = {
        saleTransactionHistoryId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteSaletransactionhistory(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
