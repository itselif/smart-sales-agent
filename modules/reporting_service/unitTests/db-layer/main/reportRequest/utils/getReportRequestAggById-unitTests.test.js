const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportRequestAggById module", () => {
  let sandbox;
  let getReportRequestAggById;
  let ReportRequestStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportRequest" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getReportRequestAggById = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/getReportRequestAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getReportRequestAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getReportRequestAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportRequestStub.findOne);
      sinon.assert.calledOnce(ReportRequestStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getReportRequestAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportRequestStub.findAll);
      sinon.assert.calledOnce(ReportRequestStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      ReportRequestStub.findOne.resolves(null);
      const result = await getReportRequestAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      ReportRequestStub.findAll.resolves([]);
      const result = await getReportRequestAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      ReportRequestStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportRequestAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      ReportRequestStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportRequestAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      ReportRequestStub.findOne.rejects(new Error("fail"));
      try {
        await getReportRequestAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      ReportRequestStub.findAll.rejects(new Error("all fail"));
      try {
        await getReportRequestAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      ReportRequestStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getReportRequestAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
