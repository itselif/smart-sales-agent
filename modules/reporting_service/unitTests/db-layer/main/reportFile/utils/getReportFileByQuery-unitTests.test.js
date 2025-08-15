const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getReportFileByQuery module", () => {
  let sandbox;
  let getReportFileByQuery;
  let ReportFileStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test ReportFile",
    getData: () => ({ id: fakeId, name: "Test ReportFile" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getReportFileByQuery = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/getReportFileByQuery",
      {
        models: { ReportFile: ReportFileStub },
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

  describe("getReportFileByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getReportFileByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test ReportFile" });
      sinon.assert.calledOnce(ReportFileStub.findOne);
      sinon.assert.calledWith(ReportFileStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      ReportFileStub.findOne.resolves(null);

      const result = await getReportFileByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(ReportFileStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getReportFileByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getReportFileByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      ReportFileStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getReportFileByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      ReportFileStub.findOne.resolves({ getData: () => undefined });

      const result = await getReportFileByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
