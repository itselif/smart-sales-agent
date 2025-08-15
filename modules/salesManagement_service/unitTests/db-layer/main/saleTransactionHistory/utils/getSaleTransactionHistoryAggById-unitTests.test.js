const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getSaleTransactionHistoryAggById module", () => {
  let sandbox;
  let getSaleTransactionHistoryAggById;
  let SaleTransactionHistoryStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test SaleTransactionHistory" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getSaleTransactionHistoryAggById = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryAggById",
      {
        models: { SaleTransactionHistory: SaleTransactionHistoryStub },
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

  describe("getSaleTransactionHistoryAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getSaleTransactionHistoryAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findOne);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getSaleTransactionHistoryAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.findAll);
      sinon.assert.calledOnce(SaleTransactionHistoryStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      SaleTransactionHistoryStub.findOne.resolves(null);
      const result = await getSaleTransactionHistoryAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      SaleTransactionHistoryStub.findAll.resolves([]);
      const result = await getSaleTransactionHistoryAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      SaleTransactionHistoryStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getSaleTransactionHistoryAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      SaleTransactionHistoryStub.findOne.resolves({ getData: () => undefined });
      const result = await getSaleTransactionHistoryAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      SaleTransactionHistoryStub.findOne.rejects(new Error("fail"));
      try {
        await getSaleTransactionHistoryAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      SaleTransactionHistoryStub.findAll.rejects(new Error("all fail"));
      try {
        await getSaleTransactionHistoryAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      SaleTransactionHistoryStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getSaleTransactionHistoryAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
