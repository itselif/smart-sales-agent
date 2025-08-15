const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getMetricDatapointListByQuery module", () => {
  let sandbox;
  let getMetricDatapointListByQuery;
  let MetricDatapointStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getMetricDatapointListByQuery = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/getMetricDatapointListByQuery",
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

  describe("getMetricDatapointListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getMetricDatapointListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(MetricDatapointStub.findAll);
      sinon.assert.calledWithMatch(MetricDatapointStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      MetricDatapointStub.findAll.resolves(null);

      const result = await getMetricDatapointListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      MetricDatapointStub.findAll.resolves([]);

      const result = await getMetricDatapointListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      MetricDatapointStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getMetricDatapointListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getMetricDatapointListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getMetricDatapointListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      MetricDatapointStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getMetricDatapointListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingMetricDatapointListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
