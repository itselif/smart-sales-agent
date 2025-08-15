const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getReportPolicyByQuery module", () => {
  let sandbox;
  let getReportPolicyByQuery;
  let ReportPolicyStub;

  const fakeId = "uuid-123";
  const fakeRecord = {
    id: fakeId,
    name: "Test ReportPolicy",
    getData: () => ({ id: fakeId, name: "Test ReportPolicy" }),
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      findOne: sandbox.stub().resolves(fakeRecord),
    };

    getReportPolicyByQuery = proxyquire(
      "../../../../../src/db-layer/main/ReportPolicy/utils/getReportPolicyByQuery",
      {
        models: { ReportPolicy: ReportPolicyStub },
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

  describe("getReportPolicyByQuery", () => {
    it("should return the result of getData if found", async () => {
      const result = await getReportPolicyByQuery({ id: fakeId });

      expect(result).to.deep.equal({ id: fakeId, name: "Test ReportPolicy" });
      sinon.assert.calledOnce(ReportPolicyStub.findOne);
      sinon.assert.calledWith(ReportPolicyStub.findOne, {
        where: {
          id: fakeId,
          isActive: true,
        },
      });
    });

    it("should return null if no record is found", async () => {
      ReportPolicyStub.findOne.resolves(null);

      const result = await getReportPolicyByQuery({ id: fakeId });

      expect(result).to.be.null;
      sinon.assert.calledOnce(ReportPolicyStub.findOne);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getReportPolicyByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getReportPolicyByQuery("invalid-query");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap findOne errors in HttpServerError", async () => {
      ReportPolicyStub.findOne.rejects(new Error("findOne failed"));

      try {
        await getReportPolicyByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyByQuery",
        );
        expect(err.details.message).to.equal("findOne failed");
      }
    });

    it("should return undefined if getData returns undefined", async () => {
      ReportPolicyStub.findOne.resolves({ getData: () => undefined });

      const result = await getReportPolicyByQuery({ id: fakeId });

      expect(result).to.be.undefined;
    });
  });
});
