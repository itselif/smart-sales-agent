const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportFileAggById module", () => {
  let sandbox;
  let getReportFileAggById;
  let ReportFileStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportFile" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportFileStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getReportFileAggById = proxyquire(
      "../../../../../src/db-layer/main/ReportFile/utils/getReportFileAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getReportFileAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getReportFileAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportFileStub.findOne);
      sinon.assert.calledOnce(ReportFileStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getReportFileAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportFileStub.findAll);
      sinon.assert.calledOnce(ReportFileStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      ReportFileStub.findOne.resolves(null);
      const result = await getReportFileAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      ReportFileStub.findAll.resolves([]);
      const result = await getReportFileAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      ReportFileStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportFileAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      ReportFileStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportFileAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      ReportFileStub.findOne.rejects(new Error("fail"));
      try {
        await getReportFileAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      ReportFileStub.findAll.rejects(new Error("all fail"));
      try {
        await getReportFileAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      ReportFileStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getReportFileAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportFileAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
