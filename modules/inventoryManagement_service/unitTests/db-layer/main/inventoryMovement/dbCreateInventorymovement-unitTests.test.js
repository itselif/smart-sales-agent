const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbCreateInventorymovementCommand is exported from main code
describe("DbCreateInventorymovementCommand", () => {
  let DbCreateInventorymovementCommand, dbCreateInventorymovement;
  let sandbox,
    InventoryMovementStub,
    ElasticIndexerStub,
    getInventoryMovementByIdStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      findByPk: sandbox.stub(),
      create: sandbox.stub(),
    };

    getInventoryMovementByIdStub = sandbox
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

    ({ DbCreateInventorymovementCommand, dbCreateInventorymovement } =
      proxyquire(
        "../../../../src/db-layer/main/inventoryMovement/dbCreateInventorymovement",
        {
          models: { InventoryMovement: InventoryMovementStub },
          serviceCommon: { ElasticIndexer: ElasticIndexerStub },
          "./utils/getInventoryMovementById": getInventoryMovementByIdStub,
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
      const cmd = new DbCreateInventorymovementCommand({});
      expect(cmd.commandName).to.equal("dbCreateInventorymovement");
      expect(cmd.objectName).to.equal("inventoryMovement");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-inventorymovement-created",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call getInventoryMovementById and indexData", async () => {
      const cmd = new DbCreateInventorymovementCommand({
        session: "session-id",
        requestId: "req-123",
      });
      cmd.dbData = { id: 1 };

      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getInventoryMovementByIdStub, 1);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });
  });

  /* describe("runDbCommand", () => {
    

    it("should update existing inventoryMovement if found by unique index", async () => {
      const updateStub = sandbox.stub().resolves();
      const mockinventoryMovement = { update: updateStub, getData: () => ({ id: 2 }) };

      InventoryMovementStub.findOne = sandbox.stub().resolves(mockinventoryMovement);
      InventoryMovementStub.findByPk = sandbox.stub().resolves(null);

      const input = {
        dataClause: {
          
          inventoryItemId: "inventoryItemId_value",
          
          movementTimestamp: "movementTimestamp_value",
          
          name: "updated"
        },
        checkoutResult: {}
      };

      const cmd = new DbCreateInventorymovementCommand(input);
      await cmd.runDbCommand();

      expect(input.inventoryMovement).to.deep.equal({ id: 2 });
      sinon.assert.calledOnce(updateStub);
    });

    it("should create new inventoryMovement if no unique match is found", async () => {
      InventoryMovementStub.findOne = sandbox.stub().resolves(null);
      InventoryMovementStub.findByPk = sandbox.stub().resolves(null);
      InventoryMovementStub.create.resolves({
        getData: () => ({ id: 5, name: "new" }),
      });

      const input = {
        dataClause: {
          
          inventoryItemId: "inventoryItemId_value",
          
          movementTimestamp: "movementTimestamp_value",
          
          name: "new"
        }
      };

      const cmd = new DbCreateInventorymovementCommand(input);
      await cmd.runDbCommand();

      expect(input.inventoryMovement).to.deep.equal({ id: 5, name: "new" });
      sinon.assert.calledOnce(InventoryMovementStub.create);
    });

    it("should throw HttpServerError on Sequelize update failure", async () => {
      InventoryMovementStub.findByPk.rejects(new Error("Update failed"));

      const input = {
        dataClause: { id: 3 },
        checkoutResult: {},
      };

      const cmd = new DbCreateInventorymovementCommand(input);

      try {
        await cmd.runDbCommand();
        throw new Error("Should have thrown");
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include("Error in checking unique index");
      }
    });
  });*/ //// go back to fix

  describe("dbCreateInventorymovement", () => {
    it("should execute successfully and return dbData", async () => {
      InventoryMovementStub.create.resolves({ getData: () => ({ id: 9 }) });

      const input = { dataClause: { name: "inventoryMovement" } };
      const result = await dbCreateInventorymovement(input);

      expect(result).to.deep.equal({ id: 9 });
    });
  });
});
