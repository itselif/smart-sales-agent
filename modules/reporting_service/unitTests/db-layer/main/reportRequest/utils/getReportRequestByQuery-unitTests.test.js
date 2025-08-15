const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getReportRequestByQuery module", () => {
  let sandbox;
  let getReportRequestByQuery;
  let ReportRequestStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test ReportRequest",
    getData: () => ({ id: fakeId, name: "Test ReportRequest" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getReportRequestByQuery = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/getReportRequestByQuery",
      {
        models: { ReportRequest: ReportRequestStub },
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

  describe("getReportRequestByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getReportRequestByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test ReportRequest" });
      sinon.assert.calledOnce(ReportRequestStub.findOne);
      sinon.assert.calledWith(ReportRequestStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      ReportRequestStub.findOne.resolves(null);

      const result = await getReportRequestByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(ReportRequestStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getReportRequestByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getReportRequestByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      ReportRequestStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getReportRequestByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      ReportRequestStub.findOne.resolves({ getData: () => undefined });

      const result = await getReportRequestByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
