const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getOpenApiSchemaCountByQuery module", () => {
  let sandbox;
  let getOpenApiSchemaCountByQuery;
  let OpenApiSchemaStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    OpenApiSchemaStub = {
      count: sandbox.stub(),
      sum: sandbox.stub(),
      avg: sandbox.stub(),
      min: sandbox.stub(),
      max: sandbox.stub(),
    };

    getOpenApiSchemaCountByQuery = proxyquire(
      "../../../../../src/db-layer/main/OpenApiSchema/utils/getOpenApiSchemaStatsByQuery",
      {
        models: { OpenApiSchema: OpenApiSchemaStub },
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

  describe("getOpenApiSchemaCountByQuery", () => {
    const query = { isActive: true };

    it("should return count if stats is ['count']", async () => {
      OpenApiSchemaStub.count.resolves(10);
      const result = await getOpenApiSchemaCountByQuery(query, ["count"]);
      expect(result).to.equal(10);
    });

    it("should return single sum result if stats is ['sum(price)']", async () => {
      OpenApiSchemaStub.sum.resolves(100);
      const result = await getOpenApiSchemaCountByQuery(query, ["sum(price)"]);
      expect(result).to.equal(100);
    });

    it("should return single avg result if stats is ['avg(score)']", async () => {
      OpenApiSchemaStub.avg.resolves(42);
      const result = await getOpenApiSchemaCountByQuery(query, ["avg(score)"]);
      expect(result).to.equal(42);
    });

    it("should return single min result if stats is ['min(height)']", async () => {
      OpenApiSchemaStub.min.resolves(1);
      const result = await getOpenApiSchemaCountByQuery(query, ["min(height)"]);
      expect(result).to.equal(1);
    });

    it("should return single max result if stats is ['max(weight)']", async () => {
      OpenApiSchemaStub.max.resolves(99);
      const result = await getOpenApiSchemaCountByQuery(query, ["max(weight)"]);
      expect(result).to.equal(99);
    });

    it("should return object for multiple stats", async () => {
      OpenApiSchemaStub.count.resolves(5);
      OpenApiSchemaStub.sum.resolves(150);
      OpenApiSchemaStub.avg.resolves(75);

      const result = await getOpenApiSchemaCountByQuery(query, [
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
      OpenApiSchemaStub.count.resolves(7);
      const result = await getOpenApiSchemaCountByQuery(query, []);
      expect(result).to.equal(7);
    });

    it("should fallback to count if stats has no valid entry", async () => {
      OpenApiSchemaStub.count.resolves(99);
      const result = await getOpenApiSchemaCountByQuery(query, ["unknown()"]);
      expect(result).to.equal(99);
    });

    it("should wrap error in HttpServerError if count fails", async () => {
      OpenApiSchemaStub.count.rejects(new Error("count failed"));
      try {
        await getOpenApiSchemaCountByQuery(query, ["count"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingOpenApiSchemaStatsByQuery",
        );
        expect(err.details.message).to.equal("count failed");
      }
    });

    it("should wrap error in HttpServerError if sum fails", async () => {
      OpenApiSchemaStub.sum.rejects(new Error("sum failed"));
      try {
        await getOpenApiSchemaCountByQuery(query, ["sum(price)"]);
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("sum failed");
      }
    });
  });
});
