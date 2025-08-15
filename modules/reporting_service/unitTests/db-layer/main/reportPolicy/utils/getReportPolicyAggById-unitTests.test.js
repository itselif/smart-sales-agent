const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportPolicyAggById module", () => {
  let sandbox;
  let getReportPolicyAggById;
  let ReportPolicyStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportPolicy" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportPolicyStub = {
      findOne: sandbox.stub().resolves({ getData: () => fakeData }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
      getCqrsJoins: sandbox.stub().resolves(),
    };

    getReportPolicyAggById = proxyquire(
      "../../../../../src/db-layer/main/ReportPolicy/utils/getReportPolicyAggById",
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
        },
        sequelize: { Op },
      },
    );
  });

  afterEach(() => sandbox.restore());

  describe("getReportPolicyAggById", () => {
    it("should return getData() with includes for single ID", async () => {
      const result = await getReportPolicyAggById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportPolicyStub.findOne);
      sinon.assert.calledOnce(ReportPolicyStub.getCqrsJoins);
    });

    it("should return mapped getData() for array of IDs", async () => {
      const result = await getReportPolicyAggById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportPolicyStub.findAll);
      sinon.assert.calledOnce(ReportPolicyStub.getCqrsJoins);
    });

    it("should return null if not found for single ID", async () => {
      ReportPolicyStub.findOne.resolves(null);
      const result = await getReportPolicyAggById(fakeId);
      expect(result).to.equal(null);
    });

    it("should return empty array if input is array but no results", async () => {
      ReportPolicyStub.findAll.resolves([]);
      const result = await getReportPolicyAggById(["nope"]);
      expect(result).to.deep.equal([]);
    });

    it("should return undefined if getData returns undefined in array items", async () => {
      ReportPolicyStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportPolicyAggById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });

    it("should return undefined if getData returns undefined in single ID", async () => {
      ReportPolicyStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportPolicyAggById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should throw HttpServerError on unexpected error (findOne)", async () => {
      ReportPolicyStub.findOne.rejects(new Error("fail"));
      try {
        await getReportPolicyAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyAggById",
        );
        expect(err.details.message).to.equal("fail");
      }
    });

    it("should throw HttpServerError on unexpected error (findAll)", async () => {
      ReportPolicyStub.findAll.rejects(new Error("all fail"));
      try {
        await getReportPolicyAggById(["1"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyAggById",
        );
        expect(err.details.message).to.equal("all fail");
      }
    });

    it("should throw HttpServerError if getCqrsJoins fails", async () => {
      ReportPolicyStub.getCqrsJoins.rejects(new Error("joins fail"));
      try {
        await getReportPolicyAggById(fakeId);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportPolicyAggById",
        );
        expect(err.details.message).to.equal("joins fail");
      }
    });
  });
});
