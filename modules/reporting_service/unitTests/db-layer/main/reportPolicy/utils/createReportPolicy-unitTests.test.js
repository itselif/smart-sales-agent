const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createReportPolicy module", () => {
  let sandbox;
  let createReportPolicy;
  let ReportPolicyStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    reportType: "reportType_val",
    maxRetentionDays: "maxRetentionDays_val",
    allowedFormats: "allowedFormats_val",
  };
  const mockCreatedReportPolicy = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      create: sandbox.stub().resolves(mockCreatedReportPolicy),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createReportPolicy = proxyquire(
      "../../../../../src/db-layer/main/ReportPolicy/utils/createReportPolicy",
      {
        models: { ReportPolicy: ReportPolicyStub },
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

  describe("createReportPolicy", () => {
    it("should create ReportPolicy and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createReportPolicy(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(ReportPolicyStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if ReportPolicy.create fails", async () => {
      ReportPolicyStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createReportPolicy(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportPolicy");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createReportPolicy(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createReportPolicy(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportPolicyStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createReportPolicy(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createReportPolicy(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportPolicyStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["reportType"];
      try {
        await createReportPolicy(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "reportType" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with reportPolicy data", async () => {
      const input = getValidInput();
      await createReportPolicy(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createReportPolicy(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportPolicy");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
