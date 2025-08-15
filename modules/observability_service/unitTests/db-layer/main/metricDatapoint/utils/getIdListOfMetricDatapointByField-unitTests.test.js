const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getIdListOfMetricDatapointByField module", () => {
  let sandbox;
  let getIdListOfMetricDatapointByField;
  let MetricDatapointStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      findAll: sandbox.stub().resolves([{ id: "1" }, { id: "2" }]),
      metricType: "example-type",
    };

    getIdListOfMetricDatapointByField = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/getIdListOfMetricDatapointByField",
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
          NotFoundError: class NotFoundError extends Error {
            constructor(msg) {
              super(msg);
              this.name = "NotFoundError";
            }
          },
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getIdListOfMetricDatapointByField", () => {
    it("should return list of IDs when valid field and value is given", async () => {
      MetricDatapointStub["metricType"] = "string";
      const result = await getIdListOfMetricDatapointByField(
        "metricType",
        "test-value",
        false,
      );
      expect(result).to.deep.equal(["1", "2"]);
      sinon.assert.calledOnce(MetricDatapointStub.findAll);
    });

    it("should return list of IDs using Op.contains if isArray is true", async () => {
      MetricDatapointStub["metricType"] = "string";
      const result = await getIdListOfMetricDatapointByField(
        "metricType",
        "val",
        true,
      );
      const call = MetricDatapointStub.findAll.getCall(0);
      expect(call.args[0].where["metricType"][Op.contains]).to.include("val");
    });

    it("should throw BadRequestError if field name is invalid", async () => {
      try {
        await getIdListOfMetricDatapointByField("nonexistentField", "x", false);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field name");
      }
    });

    it("should throw BadRequestError if field value has wrong type", async () => {
      MetricDatapointStub["metricType"] = 123; // expects number

      try {
        await getIdListOfMetricDatapointByField(
          "metricType",
          "wrong-type",
          false,
        );
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid field value type");
      }
    });

    it("should throw NotFoundError if no records are found", async () => {
      MetricDatapointStub.findAll.resolves([]);
      MetricDatapointStub["metricType"] = "string";

      try {
        await getIdListOfMetricDatapointByField("metricType", "nomatch", false);
        throw new Error("Expected NotFoundError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("NotFoundError");
        expect(err.details.message).to.include(
          "MetricDatapoint with the specified criteria not found",
        );
      }
    });

    it("should wrap findAll error in HttpServerError", async () => {
      MetricDatapointStub.findAll.rejects(new Error("query failed"));
      MetricDatapointStub["metricType"] = "string";

      try {
        await getIdListOfMetricDatapointByField("metricType", "test", false);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.message).to.equal("query failed");
      }
    });
  });
});
