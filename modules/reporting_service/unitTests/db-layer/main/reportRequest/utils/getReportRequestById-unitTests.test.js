const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const { Op } = require("sequelize");

describe("getReportRequestById module", () => {
  let sandbox;
  let getReportRequestById;
  let ReportRequestStub;

  const fakeId = "uuid-123";
  const fakeData = { id: fakeId, name: "Test ReportRequest" };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    ReportRequestStub = {
      findOne: sandbox.stub().resolves({
        getData: () => fakeData,
      }),
      findAll: sandbox
        .stub()
        .resolves([
          { getData: () => ({ id: "1", name: "Item 1" }) },
          { getData: () => ({ id: "2", name: "Item 2" }) },
        ]),
    };

    getReportRequestById = proxyquire(
      "../../../../../src/db-layer/main/ReportRequest/utils/getReportRequestById",
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

  describe("getReportRequestById", () => {
    it("should return getData() for single ID", async () => {
      const result = await getReportRequestById(fakeId);
      expect(result).to.deep.equal(fakeData);
      sinon.assert.calledOnce(ReportRequestStub.findOne);
      sinon.assert.calledWith(
        ReportRequestStub.findOne,
        sinon.match.has("where", sinon.match.has("id", fakeId)),
      );
    });

    it("should return mapped getData() results for array of IDs", async () => {
      const result = await getReportRequestById(["1", "2"]);
      expect(result).to.deep.equal([
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ]);
      sinon.assert.calledOnce(ReportRequestStub.findAll);
      sinon.assert.calledWithMatch(ReportRequestStub.findAll, {
        where: { id: { [Op.in]: ["1", "2"] } },
      });
    });

    it("should return null if record not found (single ID)", async () => {
      ReportRequestStub.findOne.resolves(null);
      const result = await getReportRequestById(fakeId);
      expect(result).to.be.null;
    });

    it("should return null if empty array returned from findAll", async () => {
      ReportRequestStub.findAll.resolves([]);
      const result = await getReportRequestById(["a", "b"]);
      expect(result).to.deep.equal([]);
    });

    it("should wrap unexpected errors with HttpServerError (single ID)", async () => {
      ReportRequestStub.findOne.rejects(new Error("DB failure"));
      try {
        await getReportRequestById("test");
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestById",
        );
        expect(err.details.message).to.equal("DB failure");
      }
    });

    it("should wrap unexpected errors with HttpServerError (array of IDs)", async () => {
      ReportRequestStub.findAll.rejects(new Error("array failure"));
      try {
        await getReportRequestById(["fail"]);
        throw new Error("Expected HttpServerError");
      } catch (err) {
        expect(err.name).to.equal("HttpServerError");
        expect(err.message).to.equal(
          "errMsg_dbErrorWhenRequestingReportRequestById",
        );
        expect(err.details.message).to.equal("array failure");
      }
    });

    it("should return undefined if getData() returns undefined", async () => {
      ReportRequestStub.findOne.resolves({ getData: () => undefined });
      const result = await getReportRequestById(fakeId);
      expect(result).to.be.undefined;
    });

    it("should return array of undefineds if getData() returns undefined per item", async () => {
      ReportRequestStub.findAll.resolves([
        { getData: () => undefined },
        { getData: () => undefined },
      ]);
      const result = await getReportRequestById(["1", "2"]);
      expect(result).to.deep.equal([undefined, undefined]);
    });
  });
});
