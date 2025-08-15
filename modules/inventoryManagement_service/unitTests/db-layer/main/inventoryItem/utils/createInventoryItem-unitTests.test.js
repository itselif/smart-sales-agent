const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createInventoryItem module", () => {
  let sandbox;
  let createInventoryItem;
  let InventoryItemStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    productId: "productId_val",
    quantity: "quantity_val",
    status: "status_val",
    lowStockThreshold: "lowStockThreshold_val",
    storeId: "storeId_val",
  };
  const mockCreatedInventoryItem = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      create: sandbox.stub().resolves(mockCreatedInventoryItem),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createInventoryItem = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/createInventoryItem",
      {
        models: { InventoryItem: InventoryItemStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
        common: {
          HttpServerError: class HttpServerError extends Error {
            constructor(msg, details) {
              super(msg);
              this.name = "HttpServerError";
              this.details = details;
            }
          },
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          newUUID: newUUIDStub,
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  const getValidInput = (overrides = {}) => ({
    ...baseValidInput,
    ...overrides,
  });

  describe("createInventoryItem", () => {
    it("should create InventoryItem and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createInventoryItem(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(InventoryItemStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if InventoryItem.create fails", async () => {
      InventoryItemStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createInventoryItem(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingInventoryItem");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createInventoryItem(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createInventoryItem(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        InventoryItemStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createInventoryItem(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createInventoryItem(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        InventoryItemStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["productId"];
      try {
        await createInventoryItem(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include('Field "productId" is required');
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with inventoryItem data", async () => {
      const input = getValidInput();
      await createInventoryItem(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createInventoryItem(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingInventoryItem");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
