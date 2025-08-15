const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getInventoryItemAggById module", () => {
  let sandbox;
  let getInventoryItemAggById;
  let InventoryItemStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test InventoryItem" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getInventoryItemAggById = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/getInventoryItemAggById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getInventoryItemAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getInventoryItemAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(InventoryItemStub.findOne);
      sinon.assert.calledOnce(InventoryItemStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getInventoryItemAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(InventoryItemStub.findAll);
      sinon.assert.calledOnce(InventoryItemStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      InventoryItemStub.findOne.resolves(null);
      const result = await getInventoryItemAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      InventoryItemStub.findAll.resolves([]);
      const result = await getInventoryItemAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      InventoryItemStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getInventoryItemAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      InventoryItemStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryItemAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      InventoryItemStub.findOne.rejects(new Error("fail"));
      try {
        await getInventoryItemAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      InventoryItemStub.findAll.rejects(new Error("all fail"));
      try {
        await getInventoryItemAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      InventoryItemStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getInventoryItemAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
