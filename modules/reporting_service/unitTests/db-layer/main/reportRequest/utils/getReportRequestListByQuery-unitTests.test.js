const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("getReportRequestListByQuery module", () => {
  let sandbox;
  let getReportRequestListByQuery;
  let ReportRequestStub;

  const fakeList = [
    { getData: () => ({ id: "1", name: "Item 1" }) },
    { getData: () => ({ id: "2", name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findAll: sandbox.stub().resolves(fakeList),
    };

    getReportRequestListByQuery = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/getReportRequestListByQuery",
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

  describe("getReportRequestListByQuery", () => {
    it("should return list of getData() results if query is valid", async () => {
      const result = await getReportRequestListByQuery({ isActive: true });

      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);

      sinon.assert.calledOnce(ReportRequestStub.findAll);
      sinon.assert.calledWithMatch(ReportRequestStub.findAll, {
        where: { isActive: true },
      });
    });

    it("should return [] if findAll returns null", async () => {
      ReportRequestStub.findAll.resolves(null);

      const result = await getReportRequestListByQuery({ active: false });
      expect(result).to.deep.equal([]);
    });

    it("should return [] if findAll returns empty array", async () => {
      ReportRequestStub.findAll.resolves([]);

      const result = await getReportRequestListByQuery({ clientId: "xyz" });
      expect(result).to.deep.equal([]);
    });

    it("should return list of undefineds if getData() returns undefined", async () => {
      ReportRequestStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);

      const result = await getReportRequestListByQuery({ active: true });
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await getReportRequestListByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await getReportRequestListByQuery("not-an-object");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw HttpServerError if findAll fails", async () => {
      ReportRequestStub.findAll.rejects(new Error("findAll failed"));

      try {
        await getReportRequestListByQuery({ some: "query" });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestListByQuery",
        );
        expect(err.details.message).to.equal("findAll failed");
      }
    });
  });
});
