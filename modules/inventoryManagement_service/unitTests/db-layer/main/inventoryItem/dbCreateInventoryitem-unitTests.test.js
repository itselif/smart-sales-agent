const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateInventoryitemCommand is exported from main code
describe("DbCreateInventoryitemCommand", () => {
  let DbCreateInventoryitemCommand, dbCreateInventoryitem;
  let sandbox,
    InventoryItemStub,
    ElasticIndexerStub,
    getInventoryItemByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getInventoryItemByIdStub = sandbox
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

    ({ DbCreateInventoryitemCommand, dbCreateInventoryitem } = proxyquire(
      "../../../../src/db-layer/main/inventoryItem/dbCreateInventoryitem",
      {
        models: { InventoryItem: InventoryItemStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        "./utils/getInventoryItemById": getInventoryItemByIdStub,
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
      const cmd = new DbCreateInventoryitemCommand({});
      expect(cmd.commandName).to.equal("dbCreateInventoryitem");
      expect(cmd.objectName).to.equal("inventoryItem");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-inventoryitem-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getInventoryItemById and indexData", async () => {
      const cmd = new DbCreateInventoryitemCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getInventoryItemByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing inventoryItem if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockinventoryItem = { update: updateStub, getData: () => ({ id: 2 }) };

      InventoryItemStub.findOne = sandbox.stub().resolves(mockinventoryItem);
      InventoryItemStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          storeId: "storeId_value",
          
          productId: "productId_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateInventoryitemCommand(input);
      await cmd.runDbCommand();

      expect(input.inventoryItem).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new inventoryItem if no unique match is found", async () => {
      InventoryItemStub.findOne = sandbox.stub().resolves(null);
      InventoryItemStub.findByPk = sandbox.stub().resolves(null);
      InventoryItemStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          storeId: "storeId_value",
          
          productId: "productId_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateInventoryitemCommand(input);
      await cmd.runDbCommand();

      expect(input.inventoryItem).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(InventoryItemStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      InventoryItemStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateInventoryitemCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateInventoryitem", () => {
    it("should execute successfully and return dbData", async () => {
      InventoryItemStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "inventoryItem" } };
      const result = await dbCreateInventoryitem(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
