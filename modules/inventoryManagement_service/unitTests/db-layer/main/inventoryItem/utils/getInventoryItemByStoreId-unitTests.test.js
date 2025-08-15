const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getInventoryItemByStoreId module", () => {
  let sandbox;
  let getInventoryItemByStoreId;
  let InventoryItemStub;

  const mockData = { id: "123", name: "Test InventoryItem" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findOne: sandbox.stub().resolves({
        getData: () => mockData,
      }),
    };

    getInventoryItemByStoreId = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/getInventoryItemByStoreId",
      {
        models: { InventoryItem: InventoryItemStub },
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

  describe("getInventoryItemByStoreId", () => {
    it("should return getData() if inventoryItem is found", async () => {
      const result = await getInventoryItemByStoreId("some-key");
      expect(result).to.deep.equal(mockData);
      sinon.assert.calledOnce(InventoryItemStub.findOne);
      sinon.assert.calledWithMatch(InventoryItemStub.findOne, {
        where: { storeId: "some-key" },
      });
    });

    it("should return null if inventoryItem is not found", async () => {
      InventoryItemStub.findOne.resolves(null);
      const result = await getInventoryItemByStoreId("missing-key");
      expect(result).to.equal(null);
    });

    it("should return undefined if getData returns undefined", async () => {
      InventoryItemStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryItemByStoreId("key");
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError if findOne throws", async () => {
      InventoryItemStub.findOne.rejects(new Error("db failure"));

      try {
        await getInventoryItemByStoreId("key");
        throw new Error("Expected to throw");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemByStoreId",
        );
        expect(err.details.message).to.equal("db failure");
      }
    });
  });
});
