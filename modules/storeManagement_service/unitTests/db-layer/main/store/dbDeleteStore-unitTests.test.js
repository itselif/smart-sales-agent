const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteStoreCommand is exported from main code

describe("DbDeleteStoreCommand", () => {
  let DbDeleteStoreCommand, dbDeleteStore;
  let sandbox, StoreStub, getStoreByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {};

    getStoreByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.storeId || 123 };
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

    ({ DbDeleteStoreCommand, dbDeleteStore } = proxyquire(
      "../../../../src/db-layer/main/store/dbDeleteStore",
      {
        models: { Store: StoreStub },
        "./query-cache-classes": {
          StoreQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getStoreById": getStoreByIdStub,
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
      const cmd = new DbDeleteStoreCommand({});
      expect(cmd.commandName).to.equal("dbDeleteStore");
      expect(cmd.objectName).to.equal("store");
      expect(cmd.serviceLabel).to.equal("salesai-storemanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-storemanagement-service-dbevent-store-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteStoreCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteStore", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getStoreByIdStub.resolves(mockInstance);

      const input = {
        storeId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteStore(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
