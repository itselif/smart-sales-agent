const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteInventoryitemCommand is exported from main code

describe("DbDeleteInventoryitemCommand", () => {
  let DbDeleteInventoryitemCommand, dbDeleteInventoryitem;
  let sandbox,
    InventoryItemStub,
    getInventoryItemByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {};

    getInventoryItemByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.inventoryItemId || 123 };
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

    ({ DbDeleteInventoryitemCommand, dbDeleteInventoryitem } = proxyquire(
      "../../../../src/db-layer/main/inventoryItem/dbDeleteInventoryitem",
      {
        models: { InventoryItem: InventoryItemStub },
        "./query-cache-classes": {
          InventoryItemQueryCacheInvalidator: sandbox.stub(),
        },
        "./utils/getInventoryItemById": getInventoryItemByIdStub,
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
      const cmd = new DbDeleteInventoryitemCommand({});
      expect(cmd.commandName).to.equal("dbDeleteInventoryitem");
      expect(cmd.objectName).to.equal("inventoryItem");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-inventoryitem-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteInventoryitemCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteInventoryitem", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getInventoryItemByIdStub.resolves(mockInstance);

      const input = {
        inventoryItemId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteInventoryitem(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
