const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createAnomalyEvent module", () => {
  let sandbox;
  let createAnomalyEvent;
  let AnomalyEventStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    anomalyType: "anomalyType_val",
    detectedAt: "detectedAt_val",
    severity: "severity_val",
    status: "status_val",
  };
  const mockCreatedAnomalyEvent = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    AnomalyEventStub = {
      create: sandbox.stub().resolves(mockCreatedAnomalyEvent),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createAnomalyEvent = proxyquire(
      "../../../../../src/db-layer/main/AnomalyEvent/utils/createAnomalyEvent",
      {
        models: { AnomalyEvent: AnomalyEventStub },
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

  describe("createAnomalyEvent", () => {
    it("should create AnomalyEvent and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createAnomalyEvent(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(AnomalyEventStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if AnomalyEvent.create fails", async () => {
      AnomalyEventStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createAnomalyEvent(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingAnomalyEvent");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createAnomalyEvent(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createAnomalyEvent(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        AnomalyEventStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createAnomalyEvent(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createAnomalyEvent(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        AnomalyEventStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["anomalyType"];
      try {
        await createAnomalyEvent(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "anomalyType" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with anomalyEvent data", async () => {
      const input = getValidInput();
      await createAnomalyEvent(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createAnomalyEvent(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingAnomalyEvent");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
