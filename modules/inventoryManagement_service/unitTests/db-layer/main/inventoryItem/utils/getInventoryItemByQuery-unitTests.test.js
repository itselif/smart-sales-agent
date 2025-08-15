const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getInventoryItemByQuery module", () => {
  let sandbox;
  let getInventoryItemByQuery;
  let InventoryItemStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test InventoryItem",
    getData: () => ({ id: fakeId, name: "Test InventoryItem" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryItemStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getInventoryItemByQuery = proxyquire(
      "../../../../../src/db-layer/main/InventoryItem/utils/getInventoryItemByQuery",
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

  describe("getInventoryItemByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getInventoryItemByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test InventoryItem" });
      sinon.assert.calledOnce(InventoryItemStub.findOne);
      sinon.assert.calledWith(InventoryItemStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      InventoryItemStub.findOne.resolves(null);

      const result = await getInventoryItemByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(InventoryItemStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getInventoryItemByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getInventoryItemByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      InventoryItemStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getInventoryItemByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryItemByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      InventoryItemStub.findOne.resolves({ getData: () => undefined });

      const result = await getInventoryItemByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
