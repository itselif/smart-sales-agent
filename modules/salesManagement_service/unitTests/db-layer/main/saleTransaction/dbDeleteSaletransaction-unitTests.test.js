const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteSaletransactionCommand is exported from main code

describe("DbDeleteSaletransactionCommand", () => {
  let DbDeleteSaletransactionCommand, dbDeleteSaletransaction;
  let sandbox,
    SaleTransactionStub,
    getSaleTransactionByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {};

    getSaleTransactionByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.saleTransactionId || 123 };
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

    ({ DbDeleteSaletransactionCommand, dbDeleteSaletransaction } = proxyquire(
      "../../../../src/db-layer/main/saleTransaction/dbDeleteSaletransaction",
      {
        models: { SaleTransaction: SaleTransactionStub },
        "./query-cache-classes": {
          SaleTransactionQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getSaleTransactionById": getSaleTransactionByIdStub,
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
      const cmd = new DbDeleteSaletransactionCommand({});
      expect(cmd.commandName).to.equal("dbDeleteSaletransaction");
      expect(cmd.objectName).to.equal("saleTransaction");
      expect(cmd.serviceLabel).to.equal("salesai-salesmanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-salesmanagement-service-dbevent-saletransaction-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteSaletransactionCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteSaletransaction", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getSaleTransactionByIdStub.resolves(mockInstance);

      const input = {
        saleTransactionId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteSaletransaction(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
