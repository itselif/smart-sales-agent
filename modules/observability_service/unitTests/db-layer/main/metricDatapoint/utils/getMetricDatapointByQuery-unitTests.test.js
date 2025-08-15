const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getMetricDatapointByQuery module", () => {
  let sandbox;
  let getMetricDatapointByQuery;
  let MetricDatapointStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test MetricDatapoint",
    getData: () => ({ id: fakeId, name: "Test MetricDatapoint" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getMetricDatapointByQuery = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/getMetricDatapointByQuery",
      {
        models: { MetricDatapoint: MetricDatapointStub },
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

  describe("getMetricDatapointByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getMetricDatapointByQuery({ id: fakeId });

      expect(result).to.deep.equal({
        id: fakeId,
        name: "Test MetricDatapoint",
      });
      sinon.assert.calledOnce(MetricDatapointStub.findOne);
      sinon.assert.calledWith(MetricDatapointStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      MetricDatapointStub.findOne.resolves(null);

      const result = await getMetricDatapointByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(MetricDatapointStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getMetricDatapointByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getMetricDatapointByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      MetricDatapointStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getMetricDatapointByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingMetricDatapointByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      MetricDatapointStub.findOne.resolves({ getData: () => undefined });

      const result = await getMetricDatapointByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
