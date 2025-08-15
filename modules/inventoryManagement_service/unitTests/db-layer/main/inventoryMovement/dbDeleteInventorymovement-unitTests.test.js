const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbDeleteInventorymovementCommand is exported from main code

describe("DbDeleteInventorymovementCommand", () => {
  let DbDeleteInventorymovementCommand, dbDeleteInventorymovement;
  let sandbox,
    InventoryMovementStub,
    getInventoryMovementByIdStub,
    ElasticIndexerStub,
    BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {};

    getInventoryMovementByIdStub = sandbox.stub();

    ElasticIndexerStub = sandbox.stub().returns({
      deleteData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.inventoryMovementId || 123 };
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

    ({ DbDeleteInventorymovementCommand, dbDeleteInventorymovement } =
      proxyquire(
        "../../../../src/db-layer/main/inventoryMovement/dbDeleteInventorymovement",
        {
          models: { InventoryMovement: InventoryMovementStub },
          "./query-cache-classes": {
            InventoryMovementQueryCacheInvalidator: sandbox.stub(),
          },
          "./utils/getInventoryMovementById": getInventoryMovementByIdStub,
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
      const cmd = new DbDeleteInventorymovementCommand({});
      expect(cmd.commandName).to.equal("dbDeleteInventorymovement");
      expect(cmd.objectName).to.equal("inventoryMovement");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.dbEvent).to.equal(
        "salesai1-inventorymanagement-service-dbevent-inventorymovement-deleted",
      );
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer.deleteData with dbData.id", async () => {
      const cmd = new DbDeleteInventorymovementCommand({
        session: "sess",
        requestId: "req-1",
      });
      cmd.dbData = { id: 42 };

      await cmd.indexDataToElastic();

      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().deleteData, 42);
    });
  });

  describe("dbDeleteInventorymovement", () => {
    it("should execute deletion command successfully", async () => {
      const mockInstance = { id: 10 };
      getInventoryMovementByIdStub.resolves(mockInstance);

      const input = {
        inventoryMovementId: 10,
        session: "s",
        requestId: "r",
      };

      const result = await dbDeleteInventorymovement(input);

      expect(result).to.deep.equal({ id: 10 });
    });
  });
  ////syncJoins() tests will be added here
});
