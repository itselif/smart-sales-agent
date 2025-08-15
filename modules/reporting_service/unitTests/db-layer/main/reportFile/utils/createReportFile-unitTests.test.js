const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("createReportFile module", () => {
  let sandbox;
  let createReportFile;
  let ReportFileStub, ElasticIndexerStub, newUUIDStub;

  const fakeId = "uuid-123";
  const baseValidInput = {
    reportRequestId: "reportRequestId_val",
    fileUrl: "fileUrl_val",
    format: "format_val",
    downloadCount: "downloadCount_val",
  };
  const mockCreatedReportFile = {
    getData: () => ({ id: fakeId, ...baseValidInput }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      create: sandbox.stub().resolves(mockCreatedReportFile),
    };

    ElasticIndexerStub = sandbox.stub().returns({
      indexData: sandbox.stub().resolves(),
    });

    newUUIDStub = sandbox.stub().returns(fakeId);

    createReportFile = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/createReportFile",
      {
        models: { ReportFile: ReportFileStub },
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

  describe("createReportFile", () => {
    it("should create ReportFile and index to elastic if valid data", async () => {
      const input = getValidInput();
      const result = await createReportFile(input);

      expect(result).to.deep.equal({ id: fakeId, ...baseValidInput });
      sinon.assert.calledOnce(ReportFileStub.create);
      sinon.assert.calledOnce(ElasticIndexerStub);
    });

    it("should throw HttpServerError if ReportFile.create fails", async () => {
      ReportFileStub.create.rejects(new Error("DB error"));
      const input = getValidInput();

      try {
        await createReportFile(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportFile");
        expect(err.details.message).to.equal("DB error");
      }
    });
  });

  describe("validateData", () => {
    it("should generate new UUID if id is not provided", async () => {
      const input = getValidInput();
      delete input.id;
      await createReportFile(input);
      sinon.assert.calledOnce(newUUIDStub);
    });

    it("should use provided id if present", async () => {
      const input = getValidInput({ id: "existing-id" });
      await createReportFile(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportFileStub.create,
        sinon.match({ id: "existing-id" }),
      );
    });

    it("should not throw if requiredFields is satisfied", async () => {
      const input = getValidInput();
      await createReportFile(input);
    });

    it("should not overwrite id if already present", async () => {
      const input = getValidInput({ id: "custom-id" });
      await createReportFile(input);
      sinon.assert.notCalled(newUUIDStub);
      sinon.assert.calledWith(
        ReportFileStub.create,
        sinon.match({ id: "custom-id" }),
      );
    });

    it("should throw BadRequestError if required field is missing", async () => {
      const input = getValidInput();
      delete input["reportRequestId"];
      try {
        await createReportFile(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include(
          'Field "reportRequestId" is required',
        );
      }
    });
  });

  describe("indexDataToElastic", () => {
    it("should call ElasticIndexer with reportFile data", async () => {
      const input = getValidInput();
      await createReportFile(input);
      sinon.assert.calledOnce(ElasticIndexerStub);
      sinon.assert.calledOnce(ElasticIndexerStub().indexData);
    });

    it("should throw HttpServerError if ElasticIndexer.indexData fails", async () => {
      ElasticIndexerStub().indexData.rejects(new Error("Elastic error"));
      const input = getValidInput();

      try {
        await createReportFile(input);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal("errMsg_dbErrorWhenCreatingReportFile");
        expect(err.details.message).to.equal("Elastic error");
      }
    });
  });
});
