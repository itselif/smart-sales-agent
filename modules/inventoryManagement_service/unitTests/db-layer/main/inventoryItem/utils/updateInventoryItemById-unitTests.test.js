const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("updateInventoryItemById module", () => {
  let sandbox;
  let updateInventoryItemById;
  let InventoryItemStub, ElasticIndexerStub;

  const fakeId = "uuid-123";
  const fakeUpdatedData = { id: fakeId, name: "Updated InventoryItem" };
  const mockDbDoc = { getData: () => fakeUpdatedData };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findOne: sandbox.stub().resolves({ id: fakeId }),
      update: sandbox.stub().resolves([1, [mockDbDoc]]),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    updateInventoryItemById = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/updateInventoryItemById",
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
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
          hexaLogger: { insertError: sandbox.stub() },
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("updateInventoryItemById", () => {
    it("should update record by direct ID", async () => {
      const result = await updateInventoryItemById(fakeId, { name: "Updated" });
      expect(result).to.deep.equal(fakeUpdatedData);
      sinon.assert.calledOnce(InventoryItemStub.findOne);
      sinon.assert.calledOnce(InventoryItemStub.update);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should extract ID from dataClause if not explicitly provided", async () => {
      const result = await updateInventoryItemById(undefined, {
        id: fakeId,
        name: "Updated",
      });
      expect(result).to.deep.equal(fakeUpdatedData);
    });

    it("should support object-as-ID input", async () => {
      const result = await updateInventoryItemById(
        { id: fakeId },
        { name: "Updated" },
      );
      expect(result).to.deep.equal(fakeUpdatedData);
    });

    it("should support object-as-only-input with ID and dataClause", async () => {
      const result = await updateInventoryItemById({
        id: fakeId,
        name: "Updated",
      });
      expect(result).to.deep.equal(fakeUpdatedData);
    });

    it("should throw BadRequestError if no ID is provided", async () => {
      try {
        await updateInventoryItemById(undefined, {});
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("ID is required");
      }
    });

    it("should throw NotFoundError if no existing record is found", async () => {
      InventoryItemStub.findOne.resolves(null);
      try {
        await updateInventoryItemById(fakeId, { name: "Updated" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          `Record with ID ${fakeId} not found`,
        );
      }
    });

    it("should throw NotFoundError if update returns no record", async () => {
      InventoryItemStub.update.resolves([0, []]);
      try {
        await updateInventoryItemById(fakeId, { name: "Updated" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include("Record not found for update");
      }
    });

    it("should throw HttpServerError if findOne fails", async () => {
      InventoryItemStub.findOne.rejects(new Error("DB fail"));
      try {
        await updateInventoryItemById(fakeId, { name: "Updated" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("DB fail");
      }
    });

    it("should throw HttpServerError if update fails", async () => {
      InventoryItemStub.update.rejects(new Error("update error"));
      try {
        await updateInventoryItemById(fakeId, { name: "Updated" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("update error");
      }
    });

    it("should throw HttpServerError if Elastic index fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("elastic error"));
      try {
        await updateInventoryItemById(fakeId, { name: "Updated" });
        throw new Error("Expected error");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("elastic error");
      }
    });
  });
});
