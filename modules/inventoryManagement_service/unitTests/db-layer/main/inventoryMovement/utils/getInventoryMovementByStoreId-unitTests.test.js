const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getInventoryMovementByStoreId module", () => {
  let sandbox;
  let getInventoryMovementByStoreId;
  let InventoryMovementStub;

  const mockData = { id: "123", name: "Test InventoryMovement" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getInventoryMovementByStoreId = proxyquire(
      "../../../../../src/db-layer/main/InventoryMovement/utils/getInventoryMovementByStoreId",
      {
        models: { InventoryMovement: InventoryMovementStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getInventoryMovementByStoreId", () => {
    it("should return getData() if inventoryMovement is found", async () => {
      const result = await getInventoryMovementByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(InventoryMovementStub.findOne);
      sinon.assert.calledWithMatch(InventoryMovementStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if inventoryMovement is not found", async () => {
      InventoryMovementStub.findOne.resolves(null);
      const result = await getInventoryMovementByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      InventoryMovementStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryMovementByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      InventoryMovementStub.findOne.rejects(new Error("db failure"));

      try {
        await getInventoryMovementByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
