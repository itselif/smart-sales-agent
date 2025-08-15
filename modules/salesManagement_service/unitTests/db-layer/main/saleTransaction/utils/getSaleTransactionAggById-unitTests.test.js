const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getSaleTransactionAggById module", () => {
  let sandbox;
  let getSaleTransactionAggById;
  let SaleTransactionStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test SaleTransaction" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getSaleTransactionAggById = proxyquire(
      "../../../../../src/db-layer/main/SaleTransaction/utils/getSaleTransactionAggById",
      {
        models: { SaleTransaction: SaleTransactionStub },
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

  describe("getSaleTransactionAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getSaleTransactionAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(SaleTransactionStub.findOne);
      sinon.assert.calledOnce(SaleTransactionStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getSaleTransactionAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(SaleTransactionStub.findAll);
      sinon.assert.calledOnce(SaleTransactionStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      SaleTransactionStub.findOne.resolves(null);
      const result = await getSaleTransactionAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      SaleTransactionStub.findAll.resolves([]);
      const result = await getSaleTransactionAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      SaleTransactionStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getSaleTransactionAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      SaleTransactionStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      SaleTransactionStub.findOne.rejects(new Error("fail"));
      try {
        await getSaleTransactionAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      SaleTransactionStub.findAll.rejects(new Error("all fail"));
      try {
        await getSaleTransactionAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      SaleTransactionStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getSaleTransactionAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
