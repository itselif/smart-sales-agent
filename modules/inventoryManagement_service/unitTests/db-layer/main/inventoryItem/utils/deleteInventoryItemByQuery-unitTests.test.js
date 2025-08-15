const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("deleteInventoryItemByQuery module", () => {
  let sandbox;
  let deleteInventoryItemByQuery;
  let InventoryItemStub;

  const fakeData = [
    { id: 1, name: "Item 1", getData: () => ({ id: 1, name: "Item 1" }) },
    { id: 2, name: "Item 2", getData: () => ({ id: 2, name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      update: sandbox.stub().resolves([2, fakeData]),
    };

    deleteInventoryItemByQuery = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/deleteInventoryItemByQuery",
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
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("deleteInventoryItemByQuery", () => {
    it("should soft-delete records matching query and return updated rows", async () => {
      const query = { clientId: "abc123" };
      const result = await deleteInventoryItemByQuery(query);

      expect(result).to.deep.equal([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);

      sinon.assert.calledOnce(InventoryItemStub.update);
      sinon.assert.calledWith(
        InventoryItemStub.update,
        { isActive: false },
        {
          where: { clientId: "abc123", isActive: true },
          returning: true,
        },
      );
    });

    it("should return empty array if no records were updated", async () => {
      InventoryItemStub.update.resolves([0, []]);

      const query = { clientId: "no-match" };
      const result = await deleteInventoryItemByQuery(query);

      expect(result).to.deep.equal([]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await deleteInventoryItemByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await deleteInventoryItemByQuery("string");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap model update() error in HttpServerError", async () => {
      InventoryItemStub.update.rejects(new Error("update error"));

      try {
        await deleteInventoryItemByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenDeletingInventoryItemByQuery",
        );
        expect(err.details.message).to.equal("update error");
      }
    });

    it("should still return mapped array even if getData returns undefined", async () => {
      const partial = [
        { getData: () => undefined },
        { getData: () => undefined },
      ];
      InventoryItemStub.update.resolves([2, partial]);

      const result = await deleteInventoryItemByQuery({ any: "field" });

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
