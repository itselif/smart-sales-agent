const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createReportRequest module", () => {
  let sandbox;
  let createReportRequest;
  let ReportRequestStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    requestedByUserId: "requestedByUserId_val",
    reportType: "reportType_val",
    storeIds: "storeIds_val",
    dateFrom: "dateFrom_val",
    dateTo: "dateTo_val",
    format: "format_val",
    status: "status_val",
  };
  const mockCreatedReportRequest = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      create: sandbox.stub().resolves(mockCreatedReportRequest),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createReportRequest = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/createReportRequest",
      {
        models: { ReportRequest: ReportRequestStub },
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

  describe("createReportRequest", () => {
    it("should create ReportRequest and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createReportRequest(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(ReportRequestStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if ReportRequest.create fails", async () => {
      ReportRequestStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createReportRequest(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportRequest");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createReportRequest(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createReportRequest(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportRequestStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createReportRequest(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createReportRequest(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportRequestStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["requestedByUserId"];
      try {
        await createReportRequest(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "requestedByUserId" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with reportRequest data", async () => {
      const input = getValidInput();
      await createReportRequest(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createReportRequest(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportRequest");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
