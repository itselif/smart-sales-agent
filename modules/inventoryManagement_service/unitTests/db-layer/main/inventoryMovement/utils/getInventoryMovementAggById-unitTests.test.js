const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getInventoryMovementAggById module", () => {
  let sandbox;
  let getInventoryMovementAggById;
  let InventoryMovementStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test InventoryMovement" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    InventoryMovementStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getInventoryMovementAggById = proxyquire(
      "../../../../../src/db-layer/main/InventoryMovement/utils/getInventoryMovementAggById",
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

  describe("getInventoryMovementAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getInventoryMovementAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(InventoryMovementStub.findOne);
      sinon.assert.calledOnce(InventoryMovementStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getInventoryMovementAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(InventoryMovementStub.findAll);
      sinon.assert.calledOnce(InventoryMovementStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      InventoryMovementStub.findOne.resolves(null);
      const result = await getInventoryMovementAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      InventoryMovementStub.findAll.resolves([]);
      const result = await getInventoryMovementAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      InventoryMovementStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getInventoryMovementAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      InventoryMovementStub.findOne.resolves({ getData: () => undefined });
      const result = await getInventoryMovementAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      InventoryMovementStub.findOne.rejects(new Error("fail"));
      try {
        await getInventoryMovementAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      InventoryMovementStub.findAll.rejects(new Error("all fail"));
      try {
        await getInventoryMovementAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      InventoryMovementStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getInventoryMovementAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingInventoryMovementAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
