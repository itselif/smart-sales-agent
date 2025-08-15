const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getInventoryItemById module", () => {
  let sandbox;
  let getInventoryItemById;
  let InventoryItemStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test InventoryItem" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getInventoryItemById = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/getInventoryItemById",
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

  describe("getInventoryItemById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getInventoryItemById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(InventoryItemStub.findOne);
      sinon.assert.calledWith(
        InventoryItemStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getInventoryItemById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(InventoryItemStub.findAll);
      sinon.assert.calledWithMatch(InventoryItemStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      InventoryItemStub.findOne.resolves(null);
      const result = await getInventoryItemById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      InventoryItemStub.findAll.resolves([]);
      const result = await getInventoryItemById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      InventoryItemStub.findOne.rejects(new Error("DB failure"));
      try {
        await getInventoryItemById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      InventoryItemStub.findAll.rejects(new Error("array failure"));
      try {
        await getInventoryItemById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      InventoryItemStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryItemById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      InventoryItemStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getInventoryItemById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
