const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

//these tests will work when DbGetInventorymovementCommand is exported from main code

describe("DbGetInventorymovementCommand", () => {
  let DbGetInventorymovementCommand, dbGetInventorymovement;
  let sandbox, InventoryMovementStub, BaseCommandStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      getCqrsJoins: sandbox.stub().resolves(),
    };

    BaseCommandStub = class {
      constructor(input, model) {
        this.input = input;
        this.model = model;
        this.session = input.session;
        this.requestId = input.requestId;
        this.dataClause = input.dataClause || {};
        this.dbData = { id: input.inventoryMovementId || 101 };
      }

      async execute() {
        return this.dbData;
      }

      loadHookFunctions() {}
      initOwnership() {}
      createEntityCacher() {}
    };

    ({ DbGetInventorymovementCommand, dbGetInventorymovement } = proxyquire(
      "../../../../src/db-layer/main/inventoryMovement/dbGetInventorymovement",
      {
        models: { InventoryMovement: InventoryMovementStub },
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
      const cmd = new DbGetInventorymovementCommand({});
      expect(cmd.commandName).to.equal("dbGetInventorymovement");
      expect(cmd.objectName).to.equal("inventoryMovement");
      expect(cmd.serviceLabel).to.equal("salesai-inventorymanagement-service");
      expect(cmd.nullResult).to.be.false;
    });
  });

  describe("getCqrsJoins", () => {
    it("should call InventoryMovement.getCqrsJoins if exists", async () => {
      const cmd = new DbGetInventorymovementCommand({});
      await cmd.getCqrsJoins({ test: true });
      sinon.assert.calledOnce(InventoryMovementStub.getCqrsJoins);
    });

    it("should skip getCqrsJoins if method is missing", async () => {
      delete InventoryMovementStub.getCqrsJoins;
      const cmd = new DbGetInventorymovementCommand({});
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
      const cmd = new DbGetInventorymovementCommand({});
      const result = cmd.buildIncludes(true);
      expect(result).to.deep.equal([]);
    });

    it("should return [] includes even if getJoins is absent", () => {
      const cmd = new DbGetInventorymovementCommand({}); // input.getJoins is undefined
      const result = cmd.buildIncludes(false);
      expect(result).to.deep.equal([]);
    });
  });

  describe("dbGetInventorymovement", () => {
    it("should execute dbGetInventorymovement and return inventoryMovement data", async () => {
      const result = await dbGetInventorymovement({
        inventoryMovementId: 777,
        session: "sess",
        requestId: "req",
      });

      expect(result).to.deep.equal({ id: 777 });
    });
  });
});
