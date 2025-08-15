const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbUpdateInventoryitemCommand is exported from main code

describe("DbUpdateInventoryitemCommand", () => {
  let DbUpdateInventoryitemCommand, dbUpdateInventoryitem;
  let sandbox, getInventoryItemByIdStub, ElasticIndexerStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getInventoryItemByIdStub = sandbox
      .stub()
      .resolves({ id: 99, name: "Updated inventoryItem" });

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    BaseCommandStub = class {
      constructor(input, model, instanceMode) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dbData = { id: input.id || 99 };
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
      async execute() {
        await this.createQueryCacheInvalidator?.();
        await this.createDbInstance?.();
        await this.indexDataToElastic?.();
        return this.dbData;
      }
    };

    ({ DbUpdateInventoryitemCommand, dbUpdateInventoryitem } = proxyquire(
      "../../../../src/db-layer/main/inventoryItem/dbUpdateInventoryitem",
      {
        "./utils/getInventoryItemById": getInventoryItemByIdStub,
        "./query-cache-classes": {
          InventoryItemQueryCacheInvalidator: sandbox.stub(),
        },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        dbCommand: {
          DBUpdateSequelizeCommand: BaseCommandStub,
        },
        common: {
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        models: {
          User: {},
        },
      },
    ));
  });

  afterEach(() => sandbox.restore());

  describe("constructor", () => {
    it("should set command metadata correctly", () => {
      const cmd = new DbUpdateInventoryitemCommand({ InventoryItemId: 1 });
      expect(cmd.commandName).to.equal("dbUpdateInventoryitem");
      expect(cmd.objectName).to.equal("inventoryItem");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.isBulk).to.be.false;
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with dbData.id", async () => {
      const cmd = new DbUpdateInventoryitemCommand({
        session: "s",
        requestId: "r",
      });

      cmd.dbData = { id: 101 };
      await cmd.indexDataToElastic();

      sinon.assert.calledWith(getInventoryItemByIdStub, 101);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledWith(ElasticIndexerStub().indexData, {
        id: 99,
        name: "Updated inventoryItem",
      });
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbUpdateInventoryitemCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });
    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbUpdateInventoryitemCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbUpdateInventoryitem", () => {
    it("should execute update successfully", async () => {
      const result = await dbUpdateInventoryitem({
        inventoryItemId: 99,
        session: "abc",
        requestId: "xyz",
      });

      expect(result).to.deep.equal({ id: 99 });
    });
  });
});
