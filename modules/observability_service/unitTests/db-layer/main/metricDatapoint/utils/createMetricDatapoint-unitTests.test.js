const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createMetricDatapoint module", () => {
  let sandbox;
  let createMetricDatapoint;
  let MetricDatapointStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    metricType: "metricType_val",
    targetType: "targetType_val",
    periodStart: "periodStart_val",
    granularity: "granularity_val",
    value: "value_val",
  };
  const mockCreatedMetricDatapoint = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    MetricDatapointStub = {
      create: sandbox.stub().resolves(mockCreatedMetricDatapoint),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createMetricDatapoint = proxyquire(
      "../../../../../src/db-layer/main/MetricDatapoint/utils/createMetricDatapoint",
      {
        models: { MetricDatapoint: MetricDatapointStub },
        serviceCommon: { ElasticIndexer: ElasticIndexerStub },
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
          newUUID: newUUIDStub,
        },
      },
    );
  });

  afterEach(() => sandbox.restore());

  const getValidInput = (overrides = {}) => ({
    ...baseValidInput,
    ...overrides,
  });

  describe("createMetricDatapoint", () => {
    it("should create MetricDatapoint and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createMetricDatapoint(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(MetricDatapointStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if MetricDatapoint.create fails", async () => {
      MetricDatapointStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createMetricDatapoint(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingMetricDatapoint",
        );
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createMetricDatapoint(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createMetricDatapoint(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        MetricDatapointStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createMetricDatapoint(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createMetricDatapoint(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        MetricDatapointStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["metricType"];
      try {
        await createMetricDatapoint(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "metricType" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with metricDatapoint data", async () => {
      const input = getValidInput();
      await createMetricDatapoint(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createMetricDatapoint(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenCreatingMetricDatapoint",
        );
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
