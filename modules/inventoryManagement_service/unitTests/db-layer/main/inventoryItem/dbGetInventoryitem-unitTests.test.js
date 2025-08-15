const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetInventoryitemCommand is exported from main code

describe("DbGetInventoryitemCommand", () => {
  let DbGetInventoryitemCommand, dbGetInventoryitem;
  let sandbox, InventoryItemStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.inventoryItemId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetInventoryitemCommand, dbGetInventoryitem } = proxyquire(
      "../../../../src/db-layer/main/inventoryItem/dbGetInventoryitem",
      {
        models: { InventoryItem: InventoryItemStub },
        dbCommand: {
          DBGetSequelizeCommand: BaseCommandStub,
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
    it("should set command metadata correctly", () => {
      const cmd = new DbGetInventoryitemCommand({});
      expect(cmd.commandName).to.equal("dbGetInventoryitem");
      expect(cmd.objectName).to.equal("inventoryItem");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call InventoryItem.getCqrsJoins if exists", async () => {
      const cmd = new DbGetInventoryitemCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(InventoryItemStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete InventoryItemStub.getCqrsJoins;
      const cmd = new DbGetInventoryitemCommand({});
      let errorThrown = false;
      try {
        await cmd.getCqrsJoins({});
      } catch (err) {
        errorThrown = true;
      }

      expect(errorThrown).to.be.false;
    });
  });

  describe("buildIncludes", () => {
    it("should return [] includes", () => {
      const cmd = new DbGetInventoryitemCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetInventoryitemCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetInventoryitem", () => {
    it("should execute dbGetInventoryitem and return inventoryItem data", async () => {
      const result = await dbGetInventoryitem({
        inventoryItemId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
