const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

describe("deleteReportFileByQuery module", () => {
  let sandbox;
  let deleteReportFileByQuery;
  let ReportFileStub;

  const fakeData = [
    { id: 1, name: "Item 1", getData: () => ({ id: 1, name: "Item 1" }) },
    { id: 2, name: "Item 2", getData: () => ({ id: 2, name: "Item 2" }) },
  ];

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      update: sandbox.stub().resolves([2, fakeData]),
    };

    deleteReportFileByQuery = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/deleteReportFileByQuery",
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

  describe("deleteReportFileByQuery", () => {
    it("should soft-delete records matching query and return updated rows", async () => {
      const query = { clientId: "abc123" };
      const result = await deleteReportFileByQuery(query);

      expect(result).to.deep.equal([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]);

      sinon.assert.calledOnce(ReportFileStub.update);
      sinon.assert.calledWith(
        ReportFileStub.update,
        { isActive: false },
        {
          where: { clientId: "abc123", isActive: true },
          returning: true,
        },
      );
    });

    it("should return empty array if no records were updated", async () => {
      ReportFileStub.update.resolves([0, []]);

      const query = { clientId: "no-match" };
      const result = await deleteReportFileByQuery(query);

      expect(result).to.deep.equal([]);
    });

    it("should throw BadRequestError if query is undefined", async () => {
      try {
        await deleteReportFileByQuery(undefined);
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should throw BadRequestError if query is not an object", async () => {
      try {
        await deleteReportFileByQuery("string");
        throw new Error("Expected BadRequestError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.details.name).to.equal("BadRequestError");
        expect(err.details.message).to.include("Invalid query");
      }
    });

    it("should wrap model update() error in HttpServerError", async () => {
      ReportFileStub.update.rejects(new Error("update error"));

      try {
        await deleteReportFileByQuery({ test: true });
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenDeletingReportFileByQuery",
        );
        expect(err.details.message).to.equal("update error");
      }
    });

    it("should still return mapped array even if getData returns undefined", async () => {
      const partial = [
        { getData: () => undefined },
        { getData: () => undefined },
      ];
      ReportFileStub.update.resolves([2, partial]);

      const result = await deleteReportFileByQuery({ any: "field" });

      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
