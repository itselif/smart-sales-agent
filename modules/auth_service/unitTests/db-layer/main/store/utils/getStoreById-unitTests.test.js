const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getStoreById module", () => {
  let sandbox;
  let getStoreById;
  let StoreStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test Store" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
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

    getStoreById = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getStoreById",
      {
        models: { Store: StoreStub },
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

  describe("getStoreById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getStoreById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(StoreStub.findOne);
      sinon.assert.calledWith(
        StoreStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getStoreById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(StoreStub.findAll);
      sinon.assert.calledWithMatch(StoreStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      StoreStub.findOne.resolves(null);
      const result = await getStoreById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      StoreStub.findAll.resolves([]);
      const result = await getStoreById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      StoreStub.findOne.rejects(new Error("DB failure"));
      try {
        await getStoreById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenRequestingStoreById");
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      StoreStub.findAll.rejects(new Error("array failure"));
      try {
        await getStoreById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenRequestingStoreById");
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      StoreStub.findOne.resolves({ getData: () => undefined });
      const result = await getStoreById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      StoreStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getStoreById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
