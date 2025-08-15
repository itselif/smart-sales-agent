const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getStoreAggById module", () => {
  let sandbox;
  let getStoreAggById;
  let StoreStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test Store" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    StoreStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getStoreAggById = proxyquire(
      "../../../../../src/db-layer/main/Store/utils/getStoreAggById",
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

  describe("getStoreAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getStoreAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(StoreStub.findOne);
      sinon.assert.calledOnce(StoreStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getStoreAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(StoreStub.findAll);
      sinon.assert.calledOnce(StoreStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      StoreStub.findOne.resolves(null);
      const result = await getStoreAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      StoreStub.findAll.resolves([]);
      const result = await getStoreAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      StoreStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getStoreAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      StoreStub.findOne.resolves({ getData: () => undefined });
      const result = await getStoreAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      StoreStub.findOne.rejects(new Error("fail"));
      try {
        await getStoreAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      StoreStub.findAll.rejects(new Error("all fail"));
      try {
        await getStoreAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      StoreStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getStoreAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingStoreAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
