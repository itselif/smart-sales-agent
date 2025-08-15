const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getInventoryMovementById module", () => {
  let sandbox;
  let getInventoryMovementById;
  let InventoryMovementStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test InventoryMovement" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
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

    getInventoryMovementById = proxyquire(
      "../../../../../src/db-layer/main/InventoryMovement/utils/getInventoryMovementById",
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
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getInventoryMovementById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getInventoryMovementById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(InventoryMovementStub.findOne);
      sinon.assert.calledWith(
        InventoryMovementStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getInventoryMovementById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(InventoryMovementStub.findAll);
      sinon.assert.calledWithMatch(InventoryMovementStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      InventoryMovementStub.findOne.resolves(null);
      const result = await getInventoryMovementById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      InventoryMovementStub.findAll.resolves([]);
      const result = await getInventoryMovementById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      InventoryMovementStub.findOne.rejects(new Error("DB failure"));
      try {
        await getInventoryMovementById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      InventoryMovementStub.findAll.rejects(new Error("array failure"));
      try {
        await getInventoryMovementById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      InventoryMovementStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryMovementById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      InventoryMovementStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getInventoryMovementById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
