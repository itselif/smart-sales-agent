const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getInventoryMovementByQuery module", () => {
  let sandbox;
  let getInventoryMovementByQuery;
  let InventoryMovementStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test InventoryMovement",
    getData: () => ({ id: fakeId, name: "Test InventoryMovement" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getInventoryMovementByQuery = proxyquire(
      "../../../../../src/db-layer/main/InventoryMovement/utils/getInventoryMovementByQuery",
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

  describe("getInventoryMovementByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getInventoryMovementByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test InventoryMovement",
      });
      sinon.assert.calledOnce(InventoryMovementStub.findOne);
      sinon.assert.calledWith(InventoryMovementStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      InventoryMovementStub.findOne.resolves(null);

      const result = await getInventoryMovementByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(InventoryMovementStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getInventoryMovementByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getInventoryMovementByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      InventoryMovementStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getInventoryMovementByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      InventoryMovementStub.findOne.resolves({ getData: () => undefined });

      const result = await getInventoryMovementByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
