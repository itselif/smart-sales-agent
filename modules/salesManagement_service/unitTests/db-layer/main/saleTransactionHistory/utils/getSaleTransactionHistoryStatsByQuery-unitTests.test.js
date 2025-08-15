const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getSaleTransactionHistoryCountByQuery module", () => {
  let sandbox;
  let getSaleTransactionHistoryCountByQuery;
  let SaleTransactionHistoryStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    SaleTransactionHistoryStub = {
      count: sandbox.stub(),
      sum: sandbox.stub(),
      avg: sandbox.stub(),
      min: sandbox.stub(),
      max: sandbox.stub(),
    };

    getSaleTransactionHistoryCountByQuery = proxyquire(
      "../../../../../src/db-layer/main/SaleTransactionHistory/utils/getSaleTransactionHistoryStatsByQuery",
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
          BadRequestError: class BadRequestError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "BadRequestError";
            }
          },
          hexaLogger: { insertError: sandbox.stub() },
        },
        sequelize: { Op: require("sequelize").Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getSaleTransactionHistoryCountByQuery", () => {
    const query = { isActive: true };

    it("should return count if stats is ['count']", async () => {
      SaleTransactionHistoryStub.count.resolves(10);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "count",
      ]);
      expect(result).to.equal(10);
    });

    it("should return single sum result if stats is ['sum(price)']", async () => {
      SaleTransactionHistoryStub.sum.resolves(100);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "sum(price)",
      ]);
      expect(result).to.equal(100);
    });

    it("should return single avg result if stats is ['avg(score)']", async () => {
      SaleTransactionHistoryStub.avg.resolves(42);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "avg(score)",
      ]);
      expect(result).to.equal(42);
    });

    it("should return single min result if stats is ['min(height)']", async () => {
      SaleTransactionHistoryStub.min.resolves(1);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "min(height)",
      ]);
      expect(result).to.equal(1);
    });

    it("should return single max result if stats is ['max(weight)']", async () => {
      SaleTransactionHistoryStub.max.resolves(99);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "max(weight)",
      ]);
      expect(result).to.equal(99);
    });

    it("should return object for multiple stats", async () => {
      SaleTransactionHistoryStub.count.resolves(5);
      SaleTransactionHistoryStub.sum.resolves(150);
      SaleTransactionHistoryStub.avg.resolves(75);

      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "count",
        "sum(price)",
        "avg(score)",
      ]);

      expect(result).to.deep.equal({
        count: 5,
        "sum-price": 150,
        "avg-score": 75,
      });
    });

    it("should fallback to count if stats is empty", async () => {
      SaleTransactionHistoryStub.count.resolves(7);
      const result = await getSaleTransactionHistoryCountByQuery(query, []);
      expect(result).to.equal(7);
    });

    it("should fallback to count if stats has no valid entry", async () => {
      SaleTransactionHistoryStub.count.resolves(99);
      const result = await getSaleTransactionHistoryCountByQuery(query, [
        "unknown()",
      ]);
      expect(result).to.equal(99);
    });

    it("should wrap error in HttpServerError if count fails", async () => {
      SaleTransactionHistoryStub.count.rejects(new Error("count failed"));
      try {
        await getSaleTransactionHistoryCountByQuery(query, ["count"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingSaleTransactionHistoryStatsByQuery",
        );
        expect(err.details.message).to.equal("count failed");
      }
    });

    it("should wrap error in HttpServerError if sum fails", async () => {
      SaleTransactionHistoryStub.sum.rejects(new Error("sum failed"));
      try {
        await getSaleTransactionHistoryCountByQuery(query, ["sum(price)"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("sum failed");
      }
    });
  });
});
