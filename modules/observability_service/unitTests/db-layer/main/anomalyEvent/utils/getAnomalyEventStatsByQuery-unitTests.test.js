const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getAnomalyEventCountByQuery module", () => {
  let sandbox;
  let getAnomalyEventCountByQuery;
  let AnomalyEventStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      count: sandbox.stub(),
      sum: sandbox.stub(),
      avg: sandbox.stub(),
      min: sandbox.stub(),
      max: sandbox.stub(),
    };

    getAnomalyEventCountByQuery = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/getAnomalyEventStatsByQuery",
      {
        models: { AnomalyEvent: AnomalyEventStub },
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

  describe("getAnomalyEventCountByQuery", () => {
    const query = { isActive: true };

    it("should return count if stats is ['count']", async () => {
      AnomalyEventStub.count.resolves(10);
      const result = await getAnomalyEventCountByQuery(query, ["count"]);
      expect(result).to.equal(10);
    });

    it("should return single sum result if stats is ['sum(price)']", async () => {
      AnomalyEventStub.sum.resolves(100);
      const result = await getAnomalyEventCountByQuery(query, ["sum(price)"]);
      expect(result).to.equal(100);
    });

    it("should return single avg result if stats is ['avg(score)']", async () => {
      AnomalyEventStub.avg.resolves(42);
      const result = await getAnomalyEventCountByQuery(query, ["avg(score)"]);
      expect(result).to.equal(42);
    });

    it("should return single min result if stats is ['min(height)']", async () => {
      AnomalyEventStub.min.resolves(1);
      const result = await getAnomalyEventCountByQuery(query, ["min(height)"]);
      expect(result).to.equal(1);
    });

    it("should return single max result if stats is ['max(weight)']", async () => {
      AnomalyEventStub.max.resolves(99);
      const result = await getAnomalyEventCountByQuery(query, ["max(weight)"]);
      expect(result).to.equal(99);
    });

    it("should return object for multiple stats", async () => {
      AnomalyEventStub.count.resolves(5);
      AnomalyEventStub.sum.resolves(150);
      AnomalyEventStub.avg.resolves(75);

      const result = await getAnomalyEventCountByQuery(query, [
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
      AnomalyEventStub.count.resolves(7);
      const result = await getAnomalyEventCountByQuery(query, []);
      expect(result).to.equal(7);
    });

    it("should fallback to count if stats has no valid entry", async () => {
      AnomalyEventStub.count.resolves(99);
      const result = await getAnomalyEventCountByQuery(query, ["unknown()"]);
      expect(result).to.equal(99);
    });

    it("should wrap error in HttpServerError if count fails", async () => {
      AnomalyEventStub.count.rejects(new Error("count failed"));
      try {
        await getAnomalyEventCountByQuery(query, ["count"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingAnomalyEventStatsByQuery",
        );
        expect(err.details.message).to.equal("count failed");
      }
    });

    it("should wrap error in HttpServerError if sum fails", async () => {
      AnomalyEventStub.sum.rejects(new Error("sum failed"));
      try {
        await getAnomalyEventCountByQuery(query, ["sum(price)"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("sum failed");
      }
    });
  });
});
